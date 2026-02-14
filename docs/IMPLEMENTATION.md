# Implementation Backlog — Remaining Work Only

**Scope:** only unfinished work. Completed phases are intentionally removed.

**Last Updated:** 2026-02-14

---

## 1) Orders Board Finalization (Admin)

**Status:** In progress

### Pending Tasks
- [ ] Add transition rules for status moves (block invalid jumps)
- [ ] Add quick manager actions in order details (template operational notes)
- [ ] Improve order card metadata (customer display instead of raw short user id)

### Acceptance
- Invalid transitions are blocked with clear feedback
- Manager can add operational notes in one click
- Order cards show manager-friendly customer context

---

## 2) User Orders History Completion

**Status:** In progress

### Pending Tasks
- [ ] Align user history statuses with current domain workflow (`pending_payment`, `paid`, `warehouse`, ...)
- [ ] Add dedicated order details entrypoint from history list
- [ ] Add cancel action for eligible statuses only
- [ ] Add pagination for larger histories

### Acceptance
- User sees only own orders with current status taxonomy
- User can open order details from history reliably
- Cancel action is available only where business rules allow it

---

## 3) Data Consistency and Migration

**Status:** In progress

### Pending Tasks
- [ ] Add one-time migration for legacy orders with outdated status/payment combinations
- [ ] Keep `statusHistory` and `comments` consistent during migration

### Acceptance
- Legacy inconsistent records are normalized safely
- Migration is idempotent and does not duplicate history events

---

## Priority Order

1. Orders Board Finalization
2. User Orders History Completion
3. Data Consistency and Migration

---

## Notes

- Supplier scope is intentionally excluded.
- Testing strategy is intentionally tracked in a separate document/workstream.
