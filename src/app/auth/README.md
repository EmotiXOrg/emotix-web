# Auth UI Flow

This folder contains auth pages/components and state-machine style login UX.

## Core flow

- `LoginForm.tsx` drives the main auth state flow:
  - method chooser
  - password login
  - social redirect
  - verification / reset / setup-password flows

- `components/MethodChooser.tsx`
  - shows available methods
  - supports skeleton placeholders while waiting for API/auth responses

## UX goals

- social login available immediately
- guide users when they choose wrong method
- preserve deterministic transitions across auth states

