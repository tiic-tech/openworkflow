import { readdir, stat } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { parseYaml } from "../contracts/yaml.js";
import { isNotFound, readTextFile } from "../fs/index.js";

export interface PlanningQueueResumeModel {
  active_queue: ActivePlanningQueue | UnknownPlanningQueue;
  current_work_item: CurrentWorkItem | UnknownCurrentWorkItem;
  warnings: string[];
  sources: string[];
}

export interface ActivePlanningQueue {
  status: "found";
  plan_id: string;
  title: string | null;
  queue_path: string;
  summary_path: string | null;
  queue_status: string | null;
  branch_boundary: string | null;
  branch_matches_current: boolean | null;
  selected_candidate: CandidateResumeSummary | null;
  completed_candidate: CandidateResumeSummary | null;
  next_recommended_candidate: CandidateResumeSummary | null;
  next_ready_candidate: CandidateResumeSummary | null;
  breakpoint: {
    status: "selected_candidate" | "next_ready_candidate" | "missing_commit_evidence" | "clean_handoff" | "ambiguous";
    reason: string;
  };
  queue_local_next_action: string | null;
  commit_evidence: {
    missing: MissingCommitEvidence[];
  };
  alternatives: QueueAlternative[];
  uncertainty: string[];
}

export interface UnknownPlanningQueue {
  status: "unknown";
  reason: string;
  uncertainty: string[];
}

export interface CurrentWorkItem {
  status: "selected" | "next_ready" | "missing_evidence" | "clean_handoff" | "ambiguous";
  plan_id: string;
  candidate_id: string | null;
  selected_change_id: string | null;
  title: string | null;
  risk: string | null;
  owned_paths: string[];
  forbidden_paths: string[];
  validation_commands: string[];
  acceptance: string[];
  scope: {
    includes: string[];
    excludes: string[];
  };
  commit_evidence: {
    required: boolean;
    expected_path: string | null;
  };
  git_governance: string[];
  selected_change_path: string | null;
  atom_tasks_path: string | null;
  implementation_brief_path: string | null;
  atom_tasks_status: string | null;
  incomplete_atom_tasks: AtomTaskSummary[];
  missing_evidence: MissingCommitEvidence[];
  next_action: string | null;
  stop_if: string[];
}

export interface UnknownCurrentWorkItem {
  status: "unknown";
  reason: string;
  uncertainty: string[];
}

export interface CandidateResumeSummary {
  id: string;
  status: string | null;
  title: string | null;
  selected_change_id: string | null;
}

export interface MissingCommitEvidence {
  candidate_id: string;
  expected_path: string | null;
  reason: string;
}

export interface QueueAlternative {
  plan_id: string;
  queue_path: string;
  reason: string;
}

export interface AtomTaskSummary {
  task_id: string | null;
  title: string | null;
  status: string | null;
}

interface QueueCandidate {
  id: string;
  status: string | null;
  title: string | null;
  risk: string | null;
  owned_paths: string[];
  selection: Record<string, unknown>;
  completion: Record<string, unknown>;
  raw: Record<string, unknown>;
}

interface QueueInfo {
  plan_id: string;
  title: string | null;
  queue_path: string;
  summary_path: string | null;
  queue_status: string | null;
  branch_boundary: string | null;
  branch_matches_current: boolean | null;
  selected_candidate: QueueCandidate | null;
  completed_candidate: QueueCandidate | null;
  next_recommended_candidate: QueueCandidate | null;
  next_ready_candidate: QueueCandidate | null;
  missing_commit_evidence: MissingCommitEvidence[];
  mtime_ms: number;
  score: number;
}

export async function buildPlanningQueueResume(root: string, currentBranch: string | null): Promise<PlanningQueueResumeModel> {
  const changesRoot = join(root, "changes");
  if (!(await exists(changesRoot))) {
    return unknownModel("changes/ directory is missing");
  }

  const queuePaths = await findFilesNamed(changesRoot, "CANDIDATE_CHANGES.yaml");
  const queues = (await Promise.all(queuePaths.map((path) => readQueueInfo(root, path, currentBranch)))).filter((item): item is QueueInfo => item !== null);
  if (queues.length === 0) {
    return unknownModel("no candidate change queues were found under changes/");
  }

  const ranked = queues.sort(compareQueues);
  const active = ranked[0];
  if (!active) {
    return unknownModel("no readable candidate change queues were found under changes/");
  }
  const alternatives = ranked.slice(1, 4).map((queue) => ({
    plan_id: queue.plan_id,
    queue_path: queue.queue_path,
    reason: alternativeReason(queue),
  }));
  const tied = ranked.filter((queue) => queue !== active && queue.score === active.score);
  const uncertainty = [
    ...(tied.length > 0 ? [`${tied.length + 1} queues have the same resume rank; active queue selection may be ambiguous`] : []),
    ...(active.branch_matches_current === false ? [`current branch does not match queue boundary ${active.branch_boundary}`] : []),
  ];
  const activeQueue = activeQueueFor(active, alternatives, uncertainty);
  return {
    active_queue: activeQueue,
    current_work_item: await currentWorkItemFor(root, active, activeQueue),
    warnings: uncertainty,
    sources: queueSources(active),
  };
}

function activeQueueFor(queue: QueueInfo, alternatives: QueueAlternative[], uncertainty: string[]): ActivePlanningQueue {
  const breakpoint = breakpointFor(queue);
  return {
    status: "found",
    plan_id: queue.plan_id,
    title: queue.title,
    queue_path: queue.queue_path,
    summary_path: queue.summary_path,
    queue_status: queue.queue_status,
    branch_boundary: queue.branch_boundary,
    branch_matches_current: queue.branch_matches_current,
    selected_candidate: candidateSummary(queue.selected_candidate),
    completed_candidate: candidateSummary(queue.completed_candidate),
    next_recommended_candidate: candidateSummary(queue.next_recommended_candidate),
    next_ready_candidate: candidateSummary(queue.next_ready_candidate),
    breakpoint,
    queue_local_next_action: nextActionFor(queue, breakpoint.status),
    commit_evidence: {
      missing: queue.missing_commit_evidence,
    },
    alternatives,
    uncertainty,
  };
}

async function currentWorkItemFor(root: string, queue: QueueInfo, activeQueue: ActivePlanningQueue): Promise<CurrentWorkItem> {
  if (queue.selected_candidate) {
    return await workItemForCandidate(root, queue, queue.selected_candidate, "selected", activeQueue.queue_local_next_action);
  }
  if (queue.missing_commit_evidence.length > 0) {
    const candidate = findCandidateById(queue, queue.missing_commit_evidence[0]?.candidate_id ?? null);
    return candidate
      ? await workItemForCandidate(root, queue, candidate, "missing_evidence", activeQueue.queue_local_next_action)
      : emptyWorkItem(queue, "missing_evidence", activeQueue.queue_local_next_action, queue.missing_commit_evidence);
  }
  if (queue.next_ready_candidate) {
    return await workItemForCandidate(root, queue, queue.next_ready_candidate, "next_ready", activeQueue.queue_local_next_action);
  }
  return emptyWorkItem(queue, "clean_handoff", activeQueue.queue_local_next_action, []);
}

async function workItemForCandidate(
  root: string,
  queue: QueueInfo,
  candidate: QueueCandidate,
  status: CurrentWorkItem["status"],
  nextAction: string | null,
): Promise<CurrentWorkItem> {
  const artifacts = recordValue(candidate.selection.artifacts);
  const selectedChangePath = stringValue(artifacts.selected_change);
  const atomTasksPath = stringValue(artifacts.atom_tasks);
  const implementationBriefPath = stringValue(artifacts.implementation_brief);
  const atomTasks = atomTasksPath ? await readAtomTasks(root, atomTasksPath) : { status: null, incomplete: [] };
  const selectedChange = selectedChangePath ? await readYamlRecord(join(root, selectedChangePath)) : null;
  const boundary = boundaryForCandidate(candidate, selectedChange);
  return {
    status,
    plan_id: queue.plan_id,
    candidate_id: candidate.id,
    selected_change_id: stringValue(candidate.selection.selected_change_id),
    title: candidate.title,
    risk: candidate.risk,
    owned_paths: boundary.ownedPaths,
    forbidden_paths: boundary.forbiddenPaths,
    validation_commands: boundary.validationCommands,
    acceptance: boundary.acceptance,
    scope: boundary.scope,
    commit_evidence: {
      required: candidate.status === "selected" || candidate.completion.implementation_changed_files === true,
      expected_path: defaultEvidencePath(queue.queue_path, candidate),
    },
    git_governance: gitGovernanceFor(queue, candidate),
    selected_change_path: selectedChangePath,
    atom_tasks_path: atomTasksPath,
    implementation_brief_path: implementationBriefPath,
    atom_tasks_status: atomTasks.status,
    incomplete_atom_tasks: atomTasks.incomplete,
    missing_evidence: queue.missing_commit_evidence.filter((item) => item.candidate_id === candidate.id),
    next_action: nextAction,
    stop_if: stopConditionsFor(queue),
  };
}

async function readAtomTasks(root: string, atomTasksPath: string): Promise<{ status: string | null; incomplete: AtomTaskSummary[] }> {
  const parsed = await readYamlRecord(join(root, atomTasksPath));
  if (!parsed) {
    return { status: null, incomplete: [] };
  }
  const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
  return {
    status: stringValue(parsed.status),
    incomplete: tasks
      .filter((task) => isRecord(task) && stringValue(task.status) !== "completed")
      .map((task) => ({
        task_id: stringValue(recordValue(task).task_id),
        title: stringValue(recordValue(task).title),
        status: stringValue(recordValue(task).status),
      })),
  };
}

function emptyWorkItem(queue: QueueInfo, status: CurrentWorkItem["status"], nextAction: string | null, missingEvidence: MissingCommitEvidence[]): CurrentWorkItem {
  return {
    status,
    plan_id: queue.plan_id,
    candidate_id: null,
    selected_change_id: null,
    title: null,
    risk: null,
    owned_paths: [],
    forbidden_paths: [],
    validation_commands: [],
    acceptance: [],
    scope: {
      includes: [],
      excludes: [],
    },
    commit_evidence: {
      required: false,
      expected_path: null,
    },
    git_governance: stopConditionsFor(queue),
    selected_change_path: null,
    atom_tasks_path: null,
    implementation_brief_path: null,
    atom_tasks_status: null,
    incomplete_atom_tasks: [],
    missing_evidence: missingEvidence,
    next_action: nextAction,
    stop_if: stopConditionsFor(queue),
  };
}

function boundaryForCandidate(candidate: QueueCandidate, selectedChange: Record<string, unknown> | null): {
  ownedPaths: string[];
  forbiddenPaths: string[];
  validationCommands: string[];
  acceptance: string[];
  scope: { includes: string[]; excludes: string[] };
} {
  const selectedScope = recordValue(selectedChange?.scope);
  const candidateScope = recordValue(candidate.raw.scope);
  const scope = {
    includes: unique([...stringList(recordValue(candidateScope).includes), ...stringList(recordValue(selectedScope).includes)]),
    excludes: unique([...stringList(recordValue(candidateScope).excludes), ...stringList(recordValue(selectedScope).excludes)]),
  };
  return {
    ownedPaths: unique([...candidate.owned_paths, ...stringList(selectedChange?.owned_paths)]),
    forbiddenPaths: unique(stringList(selectedChange?.forbidden_paths)),
    validationCommands: unique([...stringList(candidate.raw.validation), ...stringList(selectedChange?.validation)]),
    acceptance: unique([...stringList(candidate.raw.acceptance), ...stringList(selectedChange?.acceptance)]),
    scope,
  };
}

function gitGovernanceFor(queue: QueueInfo, candidate: QueueCandidate): string[] {
  return unique([
    queue.branch_boundary ? `work on branch boundary ${queue.branch_boundary}` : "",
    candidate.status === "selected" ? "complete this selected change as one local commit through openworkflow git-automation commit" : "",
    "do not push, create PRs, or mutate remote state without explicit approval",
  ]);
}

async function readQueueInfo(root: string, absoluteQueuePath: string, currentBranch: string | null): Promise<QueueInfo | null> {
  const queue = await readYamlRecord(absoluteQueuePath);
  if (!queue || queue.planning_artifact_type !== "candidate_changes") {
    return null;
  }
  const queuePath = relative(root, absoluteQueuePath);
  const summaryPath = await siblingSummaryPath(root, absoluteQueuePath);
  const queuePolicy = recordValue(queue.queue_policy);
  const planId = stringValue(queue.plan_id) ?? basename(dirname(absoluteQueuePath));
  const candidates = Array.isArray(queue.changes) ? queue.changes.map(toCandidate).filter((item): item is QueueCandidate => item !== null) : [];
  const nextRecommendedId = stringValue(queue.next_recommended_candidate_id);
  const selected = candidates.find((candidate) => candidate.status === "selected") ?? null;
  const completed = [...candidates].reverse().find((candidate) => candidate.status === "done") ?? null;
  const nextRecommended = nextRecommendedId ? candidates.find((candidate) => candidate.id === nextRecommendedId) ?? null : null;
  const nextReady = nextRecommended?.status === "ready"
    ? nextRecommended
    : candidates.find((candidate) => candidate.status === "ready") ?? null;
  const branchBoundary = stringValue(queuePolicy.branch_boundary);
  const mtime = await stat(absoluteQueuePath);
  const missingCommitEvidence = await missingCommitEvidenceFor(root, absoluteQueuePath, queuePath, queuePolicy, candidates);
  const info = {
    plan_id: planId,
    title: stringValue(queue.title),
    queue_path: queuePath,
    summary_path: summaryPath,
    queue_status: stringValue(queue.status),
    branch_boundary: branchBoundary,
    branch_matches_current: branchBoundary && currentBranch ? branchBoundary === currentBranch : null,
    selected_candidate: selected,
    completed_candidate: completed,
    next_recommended_candidate: nextRecommended,
    next_ready_candidate: nextReady,
    missing_commit_evidence: missingCommitEvidence,
    mtime_ms: mtime.mtimeMs,
    score: 0,
  };
  info.score = queueScore(info);
  return info;
}

async function missingCommitEvidenceFor(
  root: string,
  absoluteQueuePath: string,
  queuePath: string,
  queuePolicy: Record<string, unknown>,
  candidates: QueueCandidate[],
): Promise<MissingCommitEvidence[]> {
  if (queuePolicy.selected_change_commit_gate !== "strict") {
    return [];
  }
  const missing: MissingCommitEvidence[] = [];
  for (const candidate of candidates) {
    if (candidate.status !== "done" || !stringValue(candidate.selection.selected_change_id)) {
      continue;
    }
    if (candidate.completion.implementation_changed_files === false) {
      if (!stringValue(candidate.completion.commit_not_required_reason)) {
        missing.push({
          candidate_id: candidate.id,
          expected_path: null,
          reason: `${queuePath} ${candidate.id}: planning-only completion must include commit_not_required_reason`,
        });
      }
      continue;
    }
    if (candidate.completion.implementation_changed_files !== true) {
      missing.push({
        candidate_id: candidate.id,
        expected_path: null,
        reason: `${queuePath} ${candidate.id}: strict completion must set implementation_changed_files true or false`,
      });
      continue;
    }
    const evidencePath = localCommitEvidencePath(candidate.completion);
    if (!evidencePath) {
      missing.push({
        candidate_id: candidate.id,
        expected_path: defaultEvidencePath(queuePath, candidate),
        reason: `${queuePath} ${candidate.id}: implementation completion must include LOCAL_COMMIT_EVIDENCE.yaml`,
      });
      continue;
    }
    if (evidencePath.startsWith("/") || evidencePath.includes("://") || evidencePath.startsWith("..")) {
      missing.push({
        candidate_id: candidate.id,
        expected_path: evidencePath,
        reason: `${queuePath} ${candidate.id}: LOCAL_COMMIT_EVIDENCE.yaml must be repo-relative`,
      });
      continue;
    }
    if (!(await exists(join(root, evidencePath)))) {
      missing.push({
        candidate_id: candidate.id,
        expected_path: evidencePath,
        reason: `${queuePath} ${candidate.id}: missing ${evidencePath}`,
      });
    }
  }
  return missing;
}

function queueScore(queue: Omit<QueueInfo, "score">): number {
  return [
    queue.selected_candidate ? 1000 : 0,
    queue.missing_commit_evidence.length > 0 ? 800 : 0,
    queue.next_ready_candidate ? 500 : 0,
    queue.queue_status === "active" ? 100 : 0,
    queue.branch_matches_current === true ? 40 : 0,
    queue.branch_matches_current === false ? -100 : 0,
    Math.min(Math.floor(queue.mtime_ms / 1000), 1_000_000),
  ].reduce((sum, value) => sum + value, 0);
}

function compareQueues(a: QueueInfo, b: QueueInfo): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  return b.mtime_ms - a.mtime_ms;
}

function breakpointFor(queue: QueueInfo): ActivePlanningQueue["breakpoint"] {
  if (queue.selected_candidate) {
    return {
      status: "selected_candidate",
      reason: `selected candidate ${queue.selected_candidate.id} is in progress`,
    };
  }
  if (queue.missing_commit_evidence.length > 0) {
    return {
      status: "missing_commit_evidence",
      reason: queue.missing_commit_evidence[0]?.reason ?? "selected-change commit evidence is missing",
    };
  }
  if (queue.next_ready_candidate) {
    return {
      status: "next_ready_candidate",
      reason: `next ready candidate ${queue.next_ready_candidate.id} can be selected`,
    };
  }
  return {
    status: "clean_handoff",
    reason: "no selected candidate, missing commit evidence, or ready next candidate was detected",
  };
}

function nextActionFor(queue: QueueInfo, breakpoint: ActivePlanningQueue["breakpoint"]["status"]): string | null {
  if (breakpoint === "selected_candidate" && queue.selected_candidate) {
    return `continue selected change ${queue.selected_candidate.id}`;
  }
  if (breakpoint === "missing_commit_evidence") {
    return "repair selected-change commit evidence before trusting handoff";
  }
  if (breakpoint === "next_ready_candidate" && queue.next_ready_candidate) {
    return `select candidate ${queue.next_ready_candidate.id}`;
  }
  if (breakpoint === "clean_handoff") {
    return "continue with workflow.next_command";
  }
  return null;
}

function stopConditionsFor(queue: QueueInfo): string[] {
  return unique([
    ...(queue.branch_matches_current === false ? [`current branch does not match queue boundary ${queue.branch_boundary}`] : []),
    ...(queue.missing_commit_evidence.length > 0 ? queue.missing_commit_evidence.map((item) => item.reason) : []),
  ]);
}

function alternativeReason(queue: QueueInfo): string {
  if (queue.selected_candidate) {
    return `selected candidate ${queue.selected_candidate.id}`;
  }
  if (queue.missing_commit_evidence.length > 0) {
    return "missing commit evidence";
  }
  if (queue.next_ready_candidate) {
    return `next ready candidate ${queue.next_ready_candidate.id}`;
  }
  return queue.queue_status ?? "candidate queue";
}

function candidateSummary(candidate: QueueCandidate | null): CandidateResumeSummary | null {
  if (!candidate) {
    return null;
  }
  return {
    id: candidate.id,
    status: candidate.status,
    title: candidate.title,
    selected_change_id: stringValue(candidate.selection.selected_change_id),
  };
}

function findCandidateById(queue: QueueInfo, candidateId: string | null): QueueCandidate | null {
  if (!candidateId) {
    return null;
  }
  for (const candidate of [queue.selected_candidate, queue.completed_candidate, queue.next_recommended_candidate, queue.next_ready_candidate]) {
    if (candidate?.id === candidateId) {
      return candidate;
    }
  }
  return null;
}

function queueSources(queue: QueueInfo): string[] {
  return unique([
    queue.queue_path,
    queue.summary_path ?? "",
    queue.selected_candidate ? stringValue(recordValue(queue.selected_candidate.selection.artifacts).selected_change) ?? "" : "",
    queue.selected_candidate ? stringValue(recordValue(queue.selected_candidate.selection.artifacts).atom_tasks) ?? "" : "",
  ]);
}

async function siblingSummaryPath(root: string, absoluteQueuePath: string): Promise<string | null> {
  const path = join(dirname(absoluteQueuePath), "SUMMARY.yaml");
  return await exists(path) ? relative(root, path) : null;
}

function toCandidate(value: unknown): QueueCandidate | null {
  if (!isRecord(value)) {
    return null;
  }
  const id = stringValue(value.id);
  if (!id) {
    return null;
  }
  return {
    id,
    status: stringValue(value.status),
    title: stringValue(value.title),
    risk: stringValue(value.risk),
    owned_paths: stringList(value.owned_paths),
    selection: recordValue(value.selection),
    completion: recordValue(value.completion),
    raw: value,
  };
}

function localCommitEvidencePath(completion: Record<string, unknown>): string | null {
  const direct = stringValue(completion.local_commit_evidence_path) ?? stringValue(completion.local_commit_evidence);
  if (direct?.endsWith("LOCAL_COMMIT_EVIDENCE.yaml")) {
    return direct;
  }
  const evidence = Array.isArray(completion.evidence) ? completion.evidence : [];
  for (const item of evidence) {
    if (typeof item === "string" && item.endsWith("LOCAL_COMMIT_EVIDENCE.yaml")) {
      return item;
    }
  }
  return null;
}

function defaultEvidencePath(absoluteQueuePath: string, candidate: QueueCandidate): string | null {
  const selectedChange = stringValue(recordValue(candidate.selection.artifacts).selected_change);
  if (selectedChange) {
    return `${dirname(selectedChange)}/LOCAL_COMMIT_EVIDENCE.yaml`;
  }
  return `${dirname(absoluteQueuePath)}/${candidate.id}/LOCAL_COMMIT_EVIDENCE.yaml`;
}

async function readYamlRecord(path: string): Promise<Record<string, unknown> | null> {
  try {
    const value = parseYaml(await readTextFile(path));
    return isRecord(value) ? value : null;
  } catch {
    return null;
  }
}

async function findFilesNamed(root: string, fileName: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const found: string[] = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_")) {
        continue;
      }
      found.push(...(await findFilesNamed(path, fileName)));
    } else if (entry.isFile() && entry.name === fileName) {
      found.push(path);
    }
  }
  return found;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}

function unknownModel(reason: string): PlanningQueueResumeModel {
  return {
    active_queue: {
      status: "unknown",
      reason,
      uncertainty: [reason],
    },
    current_work_item: {
      status: "unknown",
      reason,
      uncertainty: [reason],
    },
    warnings: [reason],
    sources: [],
  };
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function recordValue(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}
