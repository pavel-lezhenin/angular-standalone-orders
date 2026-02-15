# Testing Priorities and Scope Guardrails

**Scope:** define a practical testing baseline for the template without creating excessive long-term maintenance load.

**Last Updated:** 2026-02-15

---

## Goals

1. Lock current behavior of critical user flows.
2. Validate Material + theme behavior for reusable UI blocks.
3. Keep test suite fast, stable, and cheap to maintain.

---

## Priority Order

### P0 — Visual/Behavior Baseline (Storybook)

**Why first:** fastest way to lock UI states and validate custom theme behavior on Material components.

**Include now:**
- Shared UI primitives used across pages.
- Form controls with validation states.
- Table/list states (empty, loading, populated).
- Dialog states (open, submitting, error).

**Do not include now:**
- Every page variant.
- Full business workflows inside stories.

**Exit criteria:**
- Stories exist for all high-reuse components.
- Theme regressions are detectable via Storybook review.

---

### P1 — Critical E2E Smoke Pack

**Why second:** protects real integration paths with minimal suite size.

**Include now (max 8 scenarios):**
1. Authentication (login/logout).
2. Shop → cart add/update/remove.
3. Guest checkout happy path.
4. Authenticated checkout happy path.
5. Payment success and confirmation.
6. Order history and order details navigation.
7. Admin product CRUD happy path.
8. Admin category CRUD happy path.

**Do not include now:**
- Browser matrix expansion.
- Deep negative permutations per flow.
- Pixel-level UI assertions.

**Execution mode:**
- Run on Chromium only by default.
- Keep as merge-gate smoke suite.

**Exit criteria:**
- All critical paths are green and deterministic.
- Flaky test rate remains near zero.

---

### P2 — Targeted Unit Tests (Risk-Based)

**Why third:** unit tests are valuable for logic-heavy code, but expensive when applied indiscriminately.

**Include now:**
- Custom validators.
- State transitions with async/race sensitivity.
- Pure mapping/normalization helpers.
- Guards and permission checks.

**Do not include now:**
- Snapshot tests for every component.
- Boilerplate tests for trivial getters/setters.
- Coverage-driven tests with low signal.

**Exit criteria:**
- High-risk logic has direct unit coverage.
- New bug-prone logic cannot regress silently.

---

## Anti-Overengineering Guardrails

1. No "test everything" policy.
2. Every added test must protect a real risk or regression class.
3. Prefer one robust test over many weak duplicates.
4. Keep fixtures minimal and reusable.
5. Remove or rewrite flaky tests immediately.

---

## Initial Capacity Envelope

- **Storybook baseline:** 1-2 days.
- **E2E smoke pack:** 1-2 days.
- **Targeted unit set:** 1 day.

Total expected first baseline: **3-5 working days**.

---

## Definition of Done for Baseline

Baseline is considered complete when:
- Storybook covers high-reuse UI states,
- smoke E2E covers critical user/business flows,
- targeted units protect highest-risk logic,
- and overall test runtime remains practical for daily development.
