/**
 * Tests for `scripts/sync-workspace-lockfile.mjs`.
 *
 * This script runs unattended on every push to `main`, with write credentials,
 * and rewrites the root lockfile — so it gets tests even though the rest of
 * `scripts/` has none.
 *
 * Each case builds a throwaway workspace in a temp dir and runs the real
 * script there as a child process, exactly as the workflow does.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { test } from "node:test";

const SCRIPT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "sync-workspace-lockfile.mjs",
);

/** Builds a temp workspace: a root lockfile plus one package.json per entry. */
function buildFixture({ lock, manifests }) {
  const dir = mkdtempSync(join(tmpdir(), "lockfile-sync-"));
  writeFileSync(join(dir, "package-lock.json"), JSON.stringify(lock, null, 2));
  for (const [path, version] of Object.entries(manifests)) {
    mkdirSync(join(dir, path), { recursive: true });
    writeFileSync(
      join(dir, path, "package.json"),
      JSON.stringify(version === null ? { name: path } : { version }, null, 2),
    );
  }
  return dir;
}

function run(cwd) {
  return execFileSync("node", [SCRIPT], { cwd, encoding: "utf8" });
}

function lockVersions(dir) {
  const lock = JSON.parse(readFileSync(join(dir, "package-lock.json"), "utf8"));
  return Object.fromEntries(
    Object.entries(lock.packages)
      .filter(([path]) => path.startsWith("packages/"))
      .map(([path, entry]) => [path, entry.version]),
  );
}

test("happy: a stale lockfile entry is brought up to the manifest version", () => {
  const dir = buildFixture({
    lock: { lockfileVersion: 3, packages: { "packages/web": { version: "1.0.0" } } },
    manifests: { "packages/web": "1.1.0" },
  });

  const output = run(dir);

  assert.equal(lockVersions(dir)["packages/web"], "1.1.0");
  assert.match(output, /packages\/web: 1\.0\.0 -> 1\.1\.0/);
});

test("happy: every workspace is synced, not just the first", () => {
  const dir = buildFixture({
    lock: {
      lockfileVersion: 3,
      packages: {
        "packages/a": { version: "1.0.0" },
        "packages/b": { version: "2.0.0" },
        "packages/c": { version: "3.0.0" },
      },
    },
    manifests: {
      "packages/a": "1.1.0",
      "packages/b": "2.1.0",
      "packages/c": "3.1.0",
    },
  });

  run(dir);

  assert.deepEqual(lockVersions(dir), {
    "packages/a": "1.1.0",
    "packages/b": "2.1.0",
    "packages/c": "3.1.0",
  });
});

test("edge: an already-synced lockfile is left byte-for-byte untouched", () => {
  const dir = buildFixture({
    lock: { lockfileVersion: 3, packages: { "packages/web": { version: "1.0.0" } } },
    manifests: { "packages/web": "1.0.0" },
  });
  const before = readFileSync(join(dir, "package-lock.json"), "utf8");

  const output = run(dir);

  assert.equal(readFileSync(join(dir, "package-lock.json"), "utf8"), before);
  assert.match(output, /already in step/);
});

test("edge: entries below a workspace root are not mistaken for workspaces", () => {
  const dir = buildFixture({
    lock: {
      lockfileVersion: 3,
      packages: {
        "packages/web": { version: "1.0.0" },
        // A nested dependency — it has no manifest of ours and must be skipped,
        // not treated as a workspace whose version needs syncing.
        "packages/web/node_modules/lodash": { version: "4.17.21" },
      },
    },
    manifests: { "packages/web": "1.1.0" },
  });

  run(dir);

  const lock = JSON.parse(readFileSync(join(dir, "package-lock.json"), "utf8"));
  assert.equal(lock.packages["packages/web/node_modules/lodash"].version, "4.17.21");
});

test("edge: a manifest without a version is skipped rather than clearing the entry", () => {
  const dir = buildFixture({
    lock: { lockfileVersion: 3, packages: { "packages/web": { version: "1.0.0" } } },
    manifests: { "packages/web": null },
  });

  run(dir);

  assert.equal(lockVersions(dir)["packages/web"], "1.0.0");
});

test("sad: a lockfile with no packages map fails loudly instead of writing garbage", () => {
  const dir = buildFixture({ lock: { lockfileVersion: 1 }, manifests: {} });

  assert.throws(
    () => run(dir),
    (error) => {
      assert.equal(error.status, 1);
      assert.match(String(error.stderr), /has no "packages" map/);
      return true;
    },
  );
});

test("sad: a missing manifest for a lockfile entry fails loudly", () => {
  const dir = buildFixture({
    lock: { lockfileVersion: 3, packages: { "packages/ghost": { version: "1.0.0" } } },
    manifests: {},
  });

  assert.throws(
    () => run(dir),
    (error) => {
      assert.equal(error.status, 1);
      assert.match(String(error.stderr), /cannot read/);
      return true;
    },
  );
});
