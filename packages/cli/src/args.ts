export interface ParsedArgs {
  command: string | undefined;
  positional: string[];
  flags: Map<string, string | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const positional: string[] = [];
  const flags = new Map<string, string | boolean>();

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value?.startsWith("--")) {
      const key = value.slice(2);
      const next = rest[index + 1];
      if (next && !next.startsWith("--")) {
        flags.set(key, next);
        index += 1;
      } else {
        flags.set(key, true);
      }
    } else if (value) {
      positional.push(value);
    }
  }

  return { command, positional, flags };
}

export function stringFlag(flags: Map<string, string | boolean>, name: string, fallback?: string): string | undefined {
  const value = flags.get(name);
  return typeof value === "string" ? value : fallback;
}

export function booleanFlag(flags: Map<string, string | boolean>, name: string): boolean {
  return flags.get(name) === true || flags.get(name) === "true";
}

