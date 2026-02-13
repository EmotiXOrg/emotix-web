# Testing Conventions

This folder contains shared test setup and utilities for unit/component testing with Vitest and React Testing Library.

## Goals

- Keep tests deterministic and fast.
- Prefer user-visible behavior over implementation details.
- Mock only external boundaries (network, Amplify, router navigation side effects).

## File Naming

- Unit tests: `*.test.ts`
- Component tests: `*.test.tsx`
- Place tests next to the source file when practical.

Examples:

- `src/auth/authApi.test.ts`
- `src/app/auth/AuthPage.test.tsx`

## Recommended Test Structure

1. Arrange: render component and prepare mocks.
2. Act: simulate user action with `userEvent`.
3. Assert: verify visible outcome or callback behavior.

## What To Mock

- `aws-amplify/auth`: always mock in tests to avoid real auth calls.
- `react-router-dom` hooks (`useNavigate`) when asserting redirects.
- i18n calls when translations are not part of the behavior under test.

## What Not To Mock

- Basic React state transitions.
- Rendering logic that can be validated through DOM assertions.

## Shared Utilities

- `src/test/setup.ts`: global setup and cleanup hooks.
- `src/test/test-utils.tsx`: render helpers for router-aware components.

## Commands

- `npm run test`: one-off test run.
- `npm run test:watch`: watch mode during development.
- `npm run test:coverage`: coverage report generation and threshold enforcement.

## Annotation Policy

- Keep comments short and focused on intent.
- For important assertions, explain what a failure implies for product behavior.
- Avoid comments for obvious mechanics (for example, simple render calls).

## Current Coverage Gate

Vitest global thresholds:

- statements: 60%
- lines: 60%
- functions: 50%
- branches: 50%

These are starter thresholds and should be raised as feature coverage expands.
