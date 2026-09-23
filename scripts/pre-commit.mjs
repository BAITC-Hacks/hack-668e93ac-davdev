import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const messageFile = process.argv[2];
const message = messageFile && existsSync(messageFile)
  ? readFileSync(messageFile, "utf8").split(/\r?\n/, 1)[0].trim()
  : undefined;
const type = message?.match(/^(feat|fix|refactor|docs|test|build|ci|chore|perf|revert)(?:\([^)]+\))?!?:/)?.[1];

const projects = ["oqucat-client", "oqucat-server"];
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const commandOptions = { stdio: "inherit", shell: process.platform === "win32" };
const changedFiles = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
  cwd: root,
  encoding: "utf8",
}).trim().split(/\r?\n/).filter(Boolean);

for (const project of projects) {
  if (!changedFiles.some((file) => file.startsWith(`${project}/`))) continue;

  const directory = join(root, project);
  if (!existsSync(join(directory, "package.json"))) continue;

  console.log(`\nRunning checks for ${project}...`);
  execFileSync(pnpmCommand, ["run", "fmt"], { cwd: directory, ...commandOptions });
  execFileSync(pnpmCommand, ["run", "lint:fix"], { cwd: directory, ...commandOptions });
  execFileSync(pnpmCommand, ["run", "typecheck"], { cwd: directory, ...commandOptions });

  if (!type) continue;

  const releaseType = type === "feat" ? "minor" : "patch";
  const packageJsonPath = join(directory, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  packageJson.version = incrementVersion(packageJson.version, releaseType);
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const packagePath = `${project}/package.json`;
  execFileSync("git", ["add", "--", packagePath], { cwd: root, stdio: "inherit" });
  console.log(`${project}: bumped ${releaseType} version and staged package.json.`);
}

function incrementVersion(version, releaseType) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`Unsupported package version: ${version}`);

  const [, major, minor, patch] = match.map(Number);
  return releaseType === "minor" ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
}
