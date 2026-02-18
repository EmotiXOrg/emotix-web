# Account Settings (Auth Methods)

This folder contains profile/account settings screens.

## Main file

- `AccountSettingsPanel.tsx`
  - loads and displays linked auth methods from backend
  - shows account email
  - supports set-password flow for social-only users
  - shows `currentlyUsed` method badge
  - uses skeleton loading placeholders for better perceived performance

## Data source

- Identity truth comes from Cognito + backend API.
- UI reads `GET /auth/methods` and does not perform linking directly.

