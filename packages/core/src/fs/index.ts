import { statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";

export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

export async function writeTextFile(path: string, content: string, force = false): Promise<"write" | "skip"> {
  if (!force) {
    try {
      await readFile(path, "utf8");
      return "skip";
    } catch (error) {
      if (!isNotFound(error)) {
        throw error;
      }
    }
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
  return "write";
}

export async function readTextFile(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

export interface RootContainedPath {
  input: string;
  root: string;
  path: string;
  relativePath: string;
}

export type LocalReferenceResolution =
  | { kind: "empty"; input: string }
  | { kind: "external"; input: string }
  | { kind: "outside-root"; input: string }
  | (RootContainedPath & { kind: "local"; exists: boolean });

export function isExternalReference(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

export function resolveRootContainedPath(root: string, value: string): RootContainedPath | null {
  const resolvedRoot = resolve(root);
  const resolvedPath = resolve(resolvedRoot, value);
  const relativePath = relative(resolvedRoot, resolvedPath);
  if (relativePath === "" || (!relativePath.startsWith("..") && !isAbsolute(relativePath))) {
    return {
      input: value,
      root: resolvedRoot,
      path: resolvedPath,
      relativePath,
    };
  }
  return null;
}

export function resolveLocalReference(
  root: string,
  value: string,
  options: { exists?: (path: string) => boolean } = {},
): LocalReferenceResolution {
  if (value.length === 0) {
    return { kind: "empty", input: value };
  }
  if (isExternalReference(value)) {
    return { kind: "external", input: value };
  }
  const contained = resolveRootContainedPath(root, value);
  if (!contained) {
    return { kind: "outside-root", input: value };
  }
  return {
    ...contained,
    kind: "local",
    exists: (options.exists ?? existsSync)(contained.path),
  };
}

function existsSync(path: string): boolean {
  try {
    statSync(path);
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
}
