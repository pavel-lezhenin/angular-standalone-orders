# AI Agent Rules (Project-Specific)

This file contains package-level AI guidance for `angular-standalone-orders`.
Global agent personas and cross-repo standards remain in parent docs.

## Source of Truth Levels

1. **Global (parent repo):**
   - `docs/agents/OVERVIEW.md`
   - `docs/agents/ARCHITECT.md`
   - `docs/agents/DEVELOPER.md`
   - `docs/agents/TESTER.md`
   - `docs/agents/DESIGN.md`
2. **Project (this package):** this file + project docs in `docs/`.

## Project Context

- Framework: Angular 21, standalone-first
- Architecture: Areas (`auth`, `shop`, `admin`) + `core` + `shared` + `bff`
- State approach: signals/computed, predictable updates
- Accessibility target: WCAG AA and AXE-clean

## Testing Policy (Project)

- Priority order:
  - `P0`: Unit tests first (high-risk logic: guards, permissions, auth/session, validators, pure mappers)
  - `P1`: Deterministic Playwright E2E smoke for critical flows
  - Storybook: separate UI coverage/documentation track, not merge-gate by default
- Runner boundaries:
  - Vitest: `src/**`
  - Playwright: `e2e/**`
  - Never mix suites in one runner
- Type-safety:
  - No `as never` in specs
  - Keep mocks contract-accurate (signals as signals, DTOs as DTOs)

Detailed scope and exit criteria are defined in `docs/TESTING_PRIORITIES.md`.

## Angular Testing Best Practices

- Do not reconfigure `TestBed` after `createComponent()`.
- Prefer behavior assertions through DOM/user interaction.
- Use `await fixture.whenStable()` where async rendering is expected.
- With Vitest, prefer native async tests or Vitest fake timers; avoid `fakeAsync`.
- For HTTP tests, register `provideHttpClient()` before `provideHttpClientTesting()`.
- Use `HttpTestingController` with `expectOne`/`match`, `flush`, and `verify()` in `afterEach`.

## Related Project Docs

- `docs/ARCHITECTURE.md`
- `docs/IMPLEMENTATION.md`
- `docs/PROJECT_STATUS.md`
- `docs/TESTING_PRIORITIES.md`
- `docs/STORYBOOK_SETUP.md`
