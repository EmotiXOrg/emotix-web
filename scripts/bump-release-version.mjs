import { readFileSync, writeFileSync } from "node:fs";

const level = process.argv[2] || "patch";
const metadataPath = process.argv[3] || "release.json";
const allowed = new Set(["major", "minor", "patch"]);

if (!allowed.has(level)) {
  console.error('Usage: node scripts/bump-release-version.mjs <major|minor|patch> [release.json]');
  process.exit(1);
}

const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(metadata.version ?? "");
if (!match) {
  console.error(`Invalid version in ${metadataPath}: ${metadata.version}`);
  process.exit(1);
}

let major = Number(match[1]);
let minor = Number(match[2]);
let patch = Number(match[3]);

if (level === "major") {
  major += 1;
  minor = 0;
  patch = 0;
} else if (level === "minor") {
  minor += 1;
  patch = 0;
} else {
  patch += 1;
}

metadata.version = `${major}.${minor}.${patch}`;
writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Bumped web release version to ${metadata.version}`);
