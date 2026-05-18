import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

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

