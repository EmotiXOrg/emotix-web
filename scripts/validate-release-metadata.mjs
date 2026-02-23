import { readFileSync } from "node:fs";

const metadataPath = process.argv[2] || "release.json";
const semverPattern = /^\d+\.\d+\.\d+$/;

function fail(message) {
  console.error(message);
  process.exit(1);
}

let metadata;
try {
  metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
} catch (error) {
  fail(`Failed to parse ${metadataPath}: ${error instanceof Error ? error.message : String(error)}`);
}

if (metadata.component !== "web") {
  fail('release.json "component" must be "web".');
}
if (!semverPattern.test(metadata.version ?? "")) {
  fail('release.json "version" must match SemVer major.minor.patch (for example, 1.2.3).');
}

const minSupported = metadata.apiContract?.minSupported;
if (!semverPattern.test(minSupported ?? "")) {
  fail('release.json "apiContract.minSupported" must match SemVer major.minor.patch.');
}

console.log(`Release metadata valid: web=${metadata.version}, minApiContract=${minSupported}`);
