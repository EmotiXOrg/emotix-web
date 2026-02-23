# Web Deployment and Versioning Flow

## Scope

- Repository: `emotix-web`
- Version source: `release.json`
- Environment manifest source of truth: SSM parameter (`/emotix/test/release-manifest` by default)
- Prod tag format: `web-v<version>` (example: `web-v1.3.2`)

## Rules

1. Web deploys independently from infra.
2. Every deployment publishes:
   - `web.version`
   - `web.git_sha`
   - `web.deploy_number` (`<run_number>.<run_attempt>`)
   - `web.min_supported_api_contract`
   - `web.deployed_at`
3. Web deployment checks compatibility before deploy:
   - deployed `infra.api_contract_version` must be `>= web.apiContract.minSupported`.

## CI Workflow

- File: `.github/workflows/deploy-test.yml`
- Trigger: push to `main` (or manual dispatch)
- Steps added for release governance:
  1. Validate `release.json`
  2. Export web version and minimum API contract
  3. Check deployed infra API contract compatibility
  4. Deploy web
  5. Publish merged deployment manifest to SSM

## Release Gating

- File: `.github/workflows/release-gate.yml`
- Trigger: push to `release/*`
- Runs validation + lint + typecheck + tests + prod build. No deployment.

- File: `.github/workflows/release-automation.yml`
- Trigger: push to `release/*`
- Runs quality checks and then `semantic-release`:
  1. Determines next version from conventional commits.
  2. Updates `release.json`.
  3. Creates release commit + tag `web-vX.Y.Z`.
  4. Publishes GitHub release notes.

- File: `.github/workflows/release-prod.yml`
- Trigger: push tag `web-v*.*.*`
- Gate checks:
  1. Tag version must match `release.json` version.
  2. Tagged commit must belong to a `release/*` branch.
  3. Quality checks must pass.
- If gate passes, workflow deploys to prod and updates prod manifest in SSM.

## Versioning

- Current approach is **fully automatic on `release/*` branches** via semantic-release.
- Version increments are based on commit messages:
  - `fix:` -> patch
  - `feat:` -> minor
  - `feat!:` or `BREAKING CHANGE:` -> major
- Optional manual fallback still exists:
  - `npm run release:bump:patch|minor|major`

## Required Repository Secret

- `RELEASE_PAT` (recommended): personal access token with `repo` scope used by semantic-release to push tag/commit in a way that triggers downstream tag workflows.

## Quick Visibility Commands

- View currently deployed test manifest:
  - `npm run release:info:test`
- View currently deployed prod manifest:
  - `npm run release:info:prod`

The app profile screen also shows embedded build metadata (version, build number, git sha, deploy time, stage).
