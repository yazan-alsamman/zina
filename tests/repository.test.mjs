/**
 * REPOSITORY SAFETY — the R-07 guard, as an executable check.
 *
 * R-07 blocked Phases 3 through 6: `git rev-parse --show-toplevel` resolved to `C:/Users/Lenovo`,
 * the user's HOME directory, because no project-local repository existed. In that state any
 * `git add -A` would stage the entire home directory — `.ssh`, `.git-credentials`, browser
 * profiles, unrelated projects.
 *
 * The owner resolved it externally before Phase 7 by creating the project-local repository. These
 * tests exist so the condition cannot silently return: a repository root is the kind of thing that
 * is verified once, assumed forever, and catastrophic when the assumption breaks.
 *
 * They assert PROPERTIES, never a specific machine's paths, so they remain valid on any clone.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

const normalise = (p) => p.replace(/\\/g, "/").replace(/\/$/, "").toLowerCase();

describe("the repository root is the project, not a parent directory", () => {
  test("git resolves to THIS project, not to a home or parent directory", () => {
    const toplevel = normalise(git("rev-parse", "--show-toplevel"));
    assert.equal(
      toplevel,
      normalise(root),
      "the git root is not the project root — this is the R-07 condition"
    );
  });

  test("the repository root contains this project's own manifest", () => {
    const toplevel = git("rev-parse", "--show-toplevel");
    assert.ok(existsSync(join(toplevel, "package.json")), "no package.json at the repository root");
    const pkg = JSON.parse(readFileSync(join(toplevel, "package.json"), "utf8"));
    assert.ok(pkg.dependencies?.astro, "the repository root is not an Astro project");
  });

  test("the root is not a home directory", () => {
    // The specific failure R-07 describes. A repository whose root holds these is somebody's
    // home, not a project.
    const toplevel = git("rev-parse", "--show-toplevel");
    for (const marker of [".ssh", ".git-credentials", "AppData", "NTUSER.DAT", "Desktop"]) {
      assert.ok(
        !existsSync(join(toplevel, marker)),
        `the repository root contains "${marker}" — it is a home directory, not a project`
      );
    }
  });
});

describe("nothing outside the project is tracked", () => {
  const tracked = () => git("ls-files").split("\n").filter(Boolean);

  test("no tracked path escapes the repository", () => {
    for (const file of tracked()) {
      assert.ok(!file.startsWith(".."), `tracked path escapes the project: ${file}`);
      assert.ok(!/^[A-Za-z]:/.test(file), `tracked path is absolute: ${file}`);
    }
  });

  test("no credential, key or personal directory is tracked", () => {
    const forbidden = [/(^|\/)\.ssh\//, /(^|\/)\.git-credentials$/, /(^|\/)\.env($|\.)/,
      /(^|\/)id_rsa/, /\.pem$/, /\.pfx$/, /(^|\/)AppData\//, /(^|\/)NTUSER/];
    for (const file of tracked()) {
      for (const pattern of forbidden) {
        assert.ok(!pattern.test(file), `a sensitive path is tracked: ${file}`);
      }
    }
  });

  test("build output and dependencies are not tracked", () => {
    for (const file of tracked()) {
      assert.ok(!/^(dist|node_modules|\.astro)\//.test(file), `build artefact tracked: ${file}`);
    }
  });

  test("the tracked tree is this project's own directories", () => {
    const top = new Set(tracked().map((f) => f.split("/")[0]));
    for (const entry of top) {
      assert.ok(
        /^(src|content|docs|tests|tools|scripts|public|package\.json|package-lock\.json|tsconfig\.json|astro\.config\.ts|README\.md|START_HERE\.md|\.gitignore)$/.test(entry),
        `unexpected top-level tracked entry: ${entry}`
      );
    }
  });
});

describe("the remote is a project remote", () => {
  test("a remote is configured and is not a local filesystem path", () => {
    const remotes = git("remote", "-v");
    assert.ok(remotes.length > 0, "no git remote is configured");
    for (const line of remotes.split("\n").filter(Boolean)) {
      const url = line.split(/\s+/)[1];
      assert.ok(
        /^(https?:\/\/|git@|ssh:\/\/)/.test(url),
        `remote is not a real URL, which suggests a local or accidental remote: ${url}`
      );
      assert.ok(!/Users\//i.test(url), `remote points into a user directory: ${url}`);
    }
  });

  test("no secret is embedded in a remote URL", () => {
    // A token pasted into a remote URL is committed to .git/config and leaks on any screen share.
    for (const line of git("remote", "-v").split("\n").filter(Boolean)) {
      const url = line.split(/\s+/)[1];
      assert.ok(!/:\/\/[^/@]*:[^/@]*@/.test(url), "a credential is embedded in the remote URL");
    }
  });
});
