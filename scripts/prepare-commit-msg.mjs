import { copyFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const messageFile = process.argv[2];
const pendingMessageFile = join(root, ".git", "codex-commit-message");
const skipFile = join(root, ".git", "codex-skip-commit-checks");
rmSync(pendingMessageFile, { force: true });
rmSync(skipFile, { force: true });

const message = readFileSync(messageFile, "utf8").split(/\r?\n/, 1)[0].trim();
const pattern = /^(feat|fix|refactor|docs|test|build|ci|chore|perf|revert)(?:\([^)]+\))?!?:\s+.+/;

if (message.startsWith("***")) {
  writeFileSync(skipFile, "");
  process.exit(0);
}

if (!pattern.test(message)) {
  console.error("Invalid commit message.");
  console.error("Use: type(scope): description");
  console.error("Allowed types: feat, fix, refactor, docs, test, build, ci, chore, perf, revert");
  process.exit(1);
}

copyFileSync(messageFile, pendingMessageFile);
