export const SCHEMA_VERSION = "0.1.0";

export const CONTRACT_TYPES = [
  "workflow",
  "context",
  "vision",
  "decision",
  "spec",
  "validation",
  "prototype",
  "change",
  "work_items",
  "team",
  "runtime",
] as const;

export type ContractType = (typeof CONTRACT_TYPES)[number];

export type ContractStatus = "draft" | "active" | "superseded" | "archived";

export interface CommonContract {
  schema_version: string;
  contract_id: string;
  contract_type: ContractType;
  title: string;
  status: ContractStatus | string;
  source_artifacts?: string[];
  depends_on?: string[];
  produces?: string[];
  updated_at?: string | null;
  [key: string]: unknown;
}

export interface InitOptions {
  root: string;
  projectTitle: string;
  projectSlug: string;
  tools: string[];
  force: boolean;
}

