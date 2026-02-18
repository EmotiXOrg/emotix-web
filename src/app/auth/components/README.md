# Auth Components

Small components used by `LoginForm` state flow:

- `EmailStep`
- `PasswordStep`
- `MethodChooser`
- `SocialButtons`

## Notes

- `MethodChooser` renders skeleton placeholders when `busy=true`.
- Keep these components presentational; orchestration and API calls should stay in `LoginForm`.

