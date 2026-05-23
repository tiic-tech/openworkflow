import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { resolveLocalReference, resolveRootContainedPath } from "../../../dist/core/src/fs/index.js";

const workspace = await mkdtemp(join(tmpdir(), "ow-path-safety-"));
await mkdir(join(workspace, "repo", "docs"), { recursive: true });
await writeFile(join(workspace, "repo", "docs", "note.md"), "ok\n", "utf8");
await mkdir(join(workspace, "repo-prefix"), { recursive: true });

try {
  const root = join(workspace, "repo");
  assert.equal(resolveRootContainedPath(root, "docs/note.md")?.path, resolve(root, "docs/note.md"));
  assert.equal(resolveRootContainedPath(root, ".")?.path, resolve(root));
  assert.equal(resolveRootContainedPath(root, "../repo-prefix/escape.txt"), null);
  assert.equal(resolveRootContainedPath(root, "../repo/../repo-prefix/escape.txt"), null);
  assert.equal(resolveRootContainedPath(root, "/tmp/outside.txt"), null);

  assert.equal(resolveLocalReference(root, "https://example.com/doc")?.kind, "external");
  assert.equal(resolveLocalReference(root, "commit: abcdef1")?.kind, "external");

  const valid = resolveLocalReference(root, "docs/note.md");
  assert.equal(valid?.kind, "local");
  assert.equal(valid.exists, true);

  const missing = resolveLocalReference(root, "docs/missing.md");
  assert.equal(missing?.kind, "local");
  assert.equal(missing.exists, false);

  assert.equal(resolveLocalReference(root, "../repo-prefix/escape.txt")?.kind, "outside-root");
} finally {
  await rm(workspace, { recursive: true, force: true });
}

console.log(`path safety fixture passed: ${fileURLToPath(import.meta.url)}`);
