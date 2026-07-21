#!/usr/bin/env node
/**
 * Sync the root `package-lock.json` with the workspace versions declared in
 * each `packages/<pkg>/package.json`.
 *
 * Why this exists: release-please bumps `packages/<pkg>/package.json` and the
 * manifest, but never the root lockfile. Its node strategy looks for a
 * lockfile *beside* each manifest, and this monorepo keeps a single one at the
 * root, so the bump lands nowhere — `npm ci` then installs metadata one
 * release behind the tag that was cut from it.
 *
 * Why not `npm install --package-lock-only`: that re-resolves the whole
 * dependency tree and can quietly lift unrelated packages to newer versions
 * inside what is supposed to be a version-bump-only release PR. This script
 * touches nothing but the `packages/*` version fields, needs no registry, and
 * is deterministic.
 *
 * Why not release-please's `node-workspace` plugin, which does update the root
 * lockfile: its `inScope()` is `releaseType === 'node'`, so it can never reach
 * `packages/beer-encyclopedia` (release-type `python`) — one of the packages
 * that needs syncing.
 *
 * Only `packages/*` entries carry a `version` in the lockfile; the matching
 * `node_modules/<name>` entries are workspace symlinks (`link: true`) with no
 * version of their own, so nothing else needs touching.
 *
 * Exit codes: 0 whether or not anything changed (idempotent by design, so the
 * caller can run it unconditionally); 1 only on a real error.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LOCKFILE = "package-lock.json";

/** Reads JSON, failing loudly rather than half-writing a lockfile. */
function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`cannot read ${path}: ${error.message}`);
  }
}

function main() {
  const lock = readJson(LOCKFILE);
  const entries = lock.packages;
  if (!entries) {
    throw new Error(`${LOCKFILE} has no "packages" map (lockfileVersion?)`);
  }

  const changes = [];
  for (const [path, entry] of Object.entries(entries)) {
    // Workspace roots only: "packages/api", never "packages/api/node_modules/x".
    if (!path.startsWith("packages/") || path.split("/").length !== 2) continue;

    const manifest = readJson(join(path, "package.json"));
    const declared = manifest.version;
    if (!declared) continue;

    if (entry.version !== declared) {
      changes.push(`${path}: ${entry.version ?? "(none)"} -> ${declared}`);
      entry.version = declared;
    }
  }

  if (changes.length === 0) {
    console.log("root lockfile already in step with the workspace manifests");
    return;
  }

  // Trailing newline: npm writes one, and omitting it would show up as a diff
  // on every subsequent `npm install`.
  writeFileSync(LOCKFILE, `${JSON.stringify(lock, null, 2)}\n`);
  console.log(`root lockfile synced (${changes.length}):`);
  for (const change of changes) console.log(`  ${change}`);
}

try {
  main();
} catch (error) {
  console.error(`sync-workspace-lockfile: ${error.message}`);
  process.exit(1);
}
