# EmotiX Web

Frontend application for EmotiX built with React, TypeScript, Vite, Tailwind, AWS Amplify Auth (Cognito), i18next, and PWA support.

This document is intended for new developers joining the project.

## 1. Project Purpose

The current implementation provides:

- Authentication UI and flows (email/password + social redirect providers).
- Authenticated app shell with route protection.
- Multi-language UI (English, German, Russian).
- Progressive Web App build and service worker registration.
- Test environment deployment via GitHub Actions to S3 + CloudFront.

The business UI under `/app/*` is currently scaffolded with placeholder screens.

## 2. Tech Stack

- React 19
- TypeScript 5 (strict mode enabled)
- Vite 7
- React Router 7
- AWS Amplify Auth v6 (Cognito Hosted UI + native auth methods)
- Tailwind CSS 3 + PostCSS + Autoprefixer
- i18next + react-i18next
- vite-plugin-pwa

## 3. Repository Structure

```text
.
|-- src/
|   |-- app/
|   |   |-- router.tsx            # Top-level routes
|   |   |-- AuthGate.tsx          # Session check + route guard
|   |   |-- AppShell.tsx          # Protected application shell
|   |   `-- auth/                 # Auth pages and reusable auth UI
|   |-- auth/
|   |   |-- amplify.ts            # Amplify/Cognito runtime configuration
|   |   `-- authApi.ts            # Native auth wrappers around Amplify
|   |-- i18n/
|   |   |-- index.ts              # i18n initialization and language persistence
|   |   `-- locales/              # Translation files per language/namespace
|   |-- index.css                 # Tailwind entry + global height rule
|   `-- main.tsx                  # App bootstrap
|-- public/
|   `-- icons/                    # PWA icons
|-- .github/workflows/
|   `-- deploy-test.yml           # Test environment deployment pipeline
|-- .env                          # Local defaults
|-- .env.test                     # Test mode build variables
|-- .env.prod                     # Production mode build variables
`-- vite.config.ts                # Vite + PWA plugin configuration
```

## 4. Local Development

### 4.1 Prerequisites

- Node.js 20.x LTS (aligned with CI workflow).
- npm 10+.

### 4.2 Install

```bash
npm ci
```

### 4.3 Run

```bash
npm run dev
```

Default Vite local URL is usually `http://localhost:5173`.

### 4.4 Build Commands

```bash
npm run build         # Default mode
npm run build:test    # Uses .env.test
npm run build:prod    # Uses .env.prod
npm run preview       # Serve dist build locally
npm run lint          # ESLint check
npm run typecheck     # TypeScript project reference check
npm run test          # Unit/component test run
npm run test:watch    # Watch mode for local development
npm run test:coverage # Coverage report + threshold gate
```

## 5. Environment Configuration

The app relies on Vite environment variables (must start with `VITE_`).

| Variable | Purpose | Example |
|---|---|---|
| `VITE_STAGE` | Environment label | `local`, `test`, `prod` |
| `VITE_AWS_REGION` | AWS region reference | `eu-central-1` |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID | `eu-central-1_xxxxx` |
| `VITE_COGNITO_USER_POOL_CLIENT_ID` | Cognito App Client ID | `xxxxxxxx` |
| `VITE_COGNITO_DOMAIN` | Hosted UI domain (full URL) | `https://auth.test.emotix.net` |
| `VITE_APP_ORIGIN` | Public app origin for redirects | `https://test.emotix.net` |
| `VITE_API_BASE_URL` | Backend API base URL (reserved for app API usage) | `https://api.test.emotix.net` |

Important:

- `VITE_APP_ORIGIN` must match allowed callback/logout URLs configured in Cognito.
- `VITE_COGNITO_DOMAIN` is normalized at runtime (the `https://` prefix is stripped internally where required).
- Never commit secrets. These values are publicly embedded in frontend bundles by design; use only non-secret identifiers.

## 6. Routing and Access Control

Defined in `src/app/router.tsx`.

| Route | Purpose |
|---|---|
| `/` | Runs `AuthGate` and redirects by session status |
| `/auth` | Auth flow container (`mode` query controls screen state) |
| `/auth/callback` | Hosted UI OAuth callback route |
| `/logout` | Local sign-out + Cognito logout redirect |
| `/app/*` | Protected app area wrapped in `RequireAuth` |

`AuthGate` redirect behavior:

1. Authenticated user -> `/app`
2. Unauthenticated user -> `/auth?mode=login`

Guard behavior is in `src/app/AuthGate.tsx` using `getCurrentUser()`.

## 7. Authentication Flows

Auth implementation combines:

- Hosted UI social login: `signInWithRedirect()` for Google/Facebook.
- Native Cognito flows: sign-up, sign-in, confirm sign-up, resend code, forgot/reset password.

Primary files:

- `src/app/auth/LoginForm.tsx` (state machine by mode)
- `src/auth/authApi.ts` (Amplify wrappers + error normalization)
- `src/auth/amplify.ts` (Amplify Auth configuration)
- `src/app/auth/CallbackPage.tsx` and `src/app/auth/LogoutPage.tsx`

Supported auth modes:

- `login`
- `signup`
- `verify`
- `forgot`
- `reset`

Security/UX detail currently implemented:

- Password reset request is anti-enumeration: request path returns success even if the user does not exist.

## 8. Internationalization (i18n)

Configured in `src/i18n/index.ts`.

- Supported languages: `en`, `de`, `ru`.
- Namespaces: `common`, `auth`.
- Selected language is persisted to `localStorage` key `emotix_lang`.
- Default fallback language: `en`.

Language can be changed in the auth card header (`src/app/auth/AuthCard.tsx`).

## 9. Styling and UI

- Tailwind CSS is enabled via `src/index.css` and `tailwind.config.js`.
- Current visual style is dark-themed auth + app shell prototype.
- `AppShell` currently contains placeholder tabs/screens for `Tonight`, `Explore`, `Profile`, and `History`.
- Shared UI primitives now live in `src/ui` (`Button`, `TextField`, `Notification`) and are the preferred base for new screens to keep styling consistent.
- Auth UI is decomposed into focused components under `src/app/auth/components` for easier iteration (`EmailStep`, `PasswordStep`, `MethodChooser`).
- Basic motion tokens are defined in `src/index.css` (`motion-fade-slide`, `motion-soft`) with `prefers-reduced-motion` handling.

## 10. PWA Setup

Configured in `vite.config.ts` with `vite-plugin-pwa`:

- `registerType: "autoUpdate"`.
- Service worker file name: `sw.js`.
- Web manifest configured with app name/icons in `public/icons`.
- Workbox `navigateFallback` set to `/index.html`.

This supports installable behavior and offline caching patterns appropriate for SPA routing.

## 11. Deployment (Test Environment)

GitHub Actions workflow: `.github/workflows/deploy-test.yml`.

Trigger:

- Push to `main`.

Process summary:

1. Install dependencies (`npm ci`).
2. Run lint (`npm run lint`).
3. Run typecheck (`npm run typecheck`).
4. Run unit/component tests (`npm run test`).
5. Enforce coverage gate (`npm run test:coverage`).
6. Build in test mode (`npm run build -- --mode test`).
7. Assume AWS role via OIDC.
8. Upload hashed bundles with immutable cache headers.
9. Upload static assets and PWA control files with cache policy split.
10. Invalidate CloudFront paths for control files (`index.html`, `sw.js`, manifest, etc.).

This deployment strategy optimizes cache efficiency while keeping entry/control files fresh.

## 12. Next Enterprise Hardening Steps

Recommended to add next:

1. E2E testing baseline:
   - Auth smoke and critical route tests (Playwright/Cypress).
2. Static checks in CI:
   - Dedicated `lint` and `typecheck` scripts and required status checks.
3. Observability:
   - Centralized error tracking (e.g., Sentry) and structured client logging.
4. API layer standardization:
   - Typed API client using `VITE_API_BASE_URL`, with auth token propagation and retry policy.
5. Security and compliance:
   - CSP and security headers at CDN layer.
   - Dependency and secret scanning gates in CI.
6. Coverage policy maturity:
   - Raise thresholds gradually as feature coverage expands.
7. Developer experience:
   - Add `.env.example` files and a documented local bootstrap checklist.

## 13. Quick Onboarding Checklist

1. Install Node.js 20 and run `npm ci`.
2. Verify `.env` values for your target environment.
3. Run `npm run dev` and validate:
   - `/auth?mode=login` renders.
   - Sign-in route transitions to `/app` after successful auth.
4. Confirm localization switching in auth UI.
5. Run `npm run lint` and `npm run typecheck` before opening PRs.
6. Run `npm run test` and `npm run test:coverage` before opening PRs.
7. Build with `npm run build:test` before opening PRs for test deployment.
