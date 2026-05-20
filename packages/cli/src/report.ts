import { SCHEMA_VERSION } from "../../core/src/contracts/index.js";

export interface CliEffects {
  planned: string[];
  written: string[];
  updated: string[];
  removed: string[];
  skipped: string[];
  unchanged: string[];
  preserved: string[];
  migration_notes: string[];
}

export interface CliJsonReport<TData = unknown> {
  schema_version: string;
  command: string;
  ok: boolean;
  root: string | null;
  data: TData;
  warnings: string[];
  errors: string[];
  effects: CliEffects;
  next_actions: string[];
}

export function emptyEffects(): CliEffects {
  return {
    planned: [],
    written: [],
    updated: [],
    removed: [],
    skipped: [],
    unchanged: [],
    preserved: [],
    migration_notes: [],
  };
}

export function printJsonReport<TData>(report: Omit<CliJsonReport<TData>, "schema_version">): void {
  console.log(JSON.stringify({ schema_version: SCHEMA_VERSION, ...report }, null, 2));
}
