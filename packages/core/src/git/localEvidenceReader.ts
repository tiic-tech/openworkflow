import { readFile } from "node:fs/promises";
import { parseYaml } from "../contracts/yaml.js";
import { resolveLocalReference } from "../fs/index.js";

export interface LocalGitCommitEvidence {
  candidate_id: string;
  selected_change_id: string | null;
  hash: string;
  role: "legacy" | "primary" | "evidence" | "head";
  evidence_path: string | null;
  source: "completion_evidence" | "local_commit_evidence";
}

export interface LocalGitValidationEvidence {
  candidate_id: string;
  selected_change_id: string | null;
  value: string;
  evidence_path: string | null;
  source: "queue_validation" | "completion_evidence" | "local_commit_evidence";
}

export interface LocalGitEvidenceReport {
  commitEvidence: LocalGitCommitEvidence[];
  validationEvidence: LocalGitValidationEvidence[];
  warnings: string[];
}

export async function readLocalGitEvidence(root: string, queue: Record<string, unknown>): Promise<LocalGitEvidenceReport> {
  const commitEvidence: LocalGitCommitEvidence[] = [];
  const validationEvidence: LocalGitValidationEvidence[] = [];
  const warnings: string[] = [];
  const seenCommits = new Set<string>();
  const seenValidation = new Set<string>();

  const addCommit = (item: LocalGitCommitEvidence): void => {
    const key = `${item.candidate_id}\0${item.selected_change_id ?? ""}\0${item.hash}\0${item.role}\0${item.evidence_path ?? ""}`;
    if (!seenCommits.has(key)) {
      seenCommits.add(key);
      commitEvidence.push(item);
    }
  };
  const addValidation = (item: LocalGitValidationEvidence): void => {
    const key = `${item.candidate_id}\0${item.selected_change_id ?? ""}\0${item.value}\0${item.evidence_path ?? ""}`;
    if (!seenValidation.has(key)) {
      seenValidation.add(key);
      validationEvidence.push(item);
    }
  };

  for (const item of array(record(queue.validation).commands_run)) {
    const value = String(item).trim();
    if (value.length > 0) {
      addValidation({
        candidate_id: "queue",
        selected_change_id: null,
        value,
        evidence_path: null,
        source: "queue_validation",
      });
    }
  }

  for (const candidate of array(queue.changes).map(record)) {
    const candidateId = stringValue(candidate.id) ?? "unknown";
    const selectedChangeId = stringValue(record(candidate.selection).selected_change_id);
    for (const rawEvidence of array(record(candidate.completion).evidence).map(String)) {
      const evidence = rawEvidence.trim();
      if (evidence.startsWith("commit:")) {
        const hash = evidence.replace(/^commit:\s*/, "").trim();
        if (hash.length > 0) {
          addCommit({
            candidate_id: candidateId,
            selected_change_id: selectedChangeId,
            hash,
            role: "legacy",
            evidence_path: null,
            source: "completion_evidence",
          });
        }
        continue;
      }
      if (evidence.startsWith("validation:")) {
        const value = evidence.replace(/^validation:\s*/, "").trim();
        if (value.length > 0) {
          addValidation({
            candidate_id: candidateId,
            selected_change_id: selectedChangeId,
            value,
            evidence_path: null,
            source: "completion_evidence",
          });
        }
        continue;
      }
      if (!evidence.endsWith("LOCAL_COMMIT_EVIDENCE.yaml")) {
        continue;
      }
      const localEvidence = await readLocalCommitEvidence(root, evidence);
      warnings.push(...localEvidence.warnings.map((warning) => `${candidateId}: ${warning}`));
      if (!localEvidence.record) {
        continue;
      }
      const evidenceSelectedChangeId = stringValue(localEvidence.record.selected_change_id) ?? selectedChangeId;
      addCommitFields(addCommit, candidateId, evidenceSelectedChangeId, evidence, localEvidence.record);
      for (const item of array(localEvidence.record.validation_evidence)) {
        const value = String(item).trim();
        if (value.length > 0) {
          addValidation({
            candidate_id: candidateId,
            selected_change_id: evidenceSelectedChangeId,
            value,
            evidence_path: evidence,
            source: "local_commit_evidence",
          });
        }
      }
    }
  }

  return { commitEvidence, validationEvidence, warnings };
}

async function readLocalCommitEvidence(root: string, evidencePath: string): Promise<{ record: Record<string, unknown> | null; warnings: string[] }> {
  const resolution = resolveLocalReference(root, evidencePath);
  if (resolution.kind !== "local") {
    return { record: null, warnings: [`commit evidence path is not a repo-local file: ${evidencePath}`] };
  }
  if (!resolution.exists) {
    return { record: null, warnings: [`commit evidence path does not exist: ${evidencePath}`] };
  }
  try {
    const parsed = record(parseYaml(await readFile(resolution.path, "utf8")));
    if (stringValue(parsed.planning_artifact_type) !== "implementation_evidence") {
      return { record: null, warnings: [`commit evidence path is not implementation_evidence: ${evidencePath}`] };
    }
    return { record: parsed, warnings: [] };
  } catch (error) {
    return { record: null, warnings: [`could not read commit evidence ${evidencePath}: ${error instanceof Error ? error.message : String(error)}`] };
  }
}

function addCommitFields(
  addCommit: (item: LocalGitCommitEvidence) => void,
  candidateId: string,
  selectedChangeId: string | null,
  evidencePath: string,
  evidence: Record<string, unknown>,
): void {
  const fields: Array<{ key: string; role: LocalGitCommitEvidence["role"] }> = [
    { key: "primary_commit", role: "primary" },
    { key: "evidence_commit", role: "evidence" },
    { key: "head_commit", role: "head" },
  ];
  for (const field of fields) {
    const hash = stringValue(evidence[field.key]);
    if (hash) {
      addCommit({
        candidate_id: candidateId,
        selected_change_id: selectedChangeId,
        hash,
        role: field.role,
        evidence_path: evidencePath,
        source: "local_commit_evidence",
      });
    }
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
