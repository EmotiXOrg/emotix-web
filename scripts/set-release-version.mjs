import { readFileSync, writeFileSync } from "node:fs";

const nextVersion = process.argv[2];
const metadataPath = process.argv[3] || "release.json";
const semverPattern = /^\d+\.\d+\.\d+$/;

if (!semverPattern.test(nextVersion ?? "")) {
  console.error("Usage: node scripts/set-release-version.mjs <major.minor.patch> [release.json]");
  process.exit(1);
}

const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
metadata.version = nextVersion;
writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Set web release version to ${nextVersion}`);
