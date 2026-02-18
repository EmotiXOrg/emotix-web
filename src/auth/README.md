# Web Auth API Layer

This folder contains frontend auth API wrappers used by React screens.

## Main file

- `authApi.ts`
  - wraps Amplify auth and backend auth endpoints
  - keeps return shape stable for UI (`{ ok: true }` / `{ ok: false, ... }`)

## Important behavior

- `getAuthMethods()` uses short-lived in-memory cache (60s) scoped by access token.
  - Reduces repeated calls to `/auth/methods` while user navigates settings.
  - `forceRefresh` can bypass cache.
  - cache invalidates after successful `setPassword()`.

- `getCurrentUserEmail()` has fallbacks:
  1. `fetchUserAttributes().email`
  2. `idToken.payload.email`
  3. `getCurrentUser().signInDetails.loginId`

This ensures profile email is available across native and social sessions.

