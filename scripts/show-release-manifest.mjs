import { execSync } from "node:child_process";

const stage = (process.argv[2] || "test").toLowerCase();
const explicitPath = process.argv[3];
const parameterPath = explicitPath || `/emotix/${stage}/release-manifest`;

function fail(message) {
    console.error(message);
    process.exit(1);
}

let raw;
try {
    raw = execSync(
        `aws ssm get-parameter --name "${parameterPath}" --query 'Parameter.Value' --output text`,
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    ).trim();
} catch (error) {
    fail(
        `Failed to fetch manifest from SSM (${parameterPath}). Ensure AWS credentials/profile is configured.`
    );
}

let parsed;
try {
    parsed = JSON.parse(raw);
} catch {
    fail(`Manifest at ${parameterPath} is not valid JSON.`);
}

console.log(JSON.stringify(parsed, null, 2));
