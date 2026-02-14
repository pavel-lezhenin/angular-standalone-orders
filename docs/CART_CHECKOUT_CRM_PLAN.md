# Cart & Checkout CRM Plan — Remaining Work Only

**Scope:** only tasks that are still pending.

**Last Updated:** 2026-02-14

---

## 1) Orders Board Finalization (Admin)

**Status:** In progress

### Pending Tasks
- [ ] Add transition rules for status moves (prevent invalid jumps)
- [ ] Add quick manager actions in order details (template notes like refund/out-of-stock)
- [ ] Improve order card metadata (customer display instead of raw short user id)

### Acceptance
- Invalid status transitions are blocked with clear feedback
- Order details support one-click operational notes

---

## 2) User Orders History Completion

**Status:** In progress

### Pending Tasks
- [ ] Connect user orders page to real BFF data only
- [ ] Add order details view from history list
- [ ] Add cancel action for eligible orders
- [ ] Add empty state and pagination

### Acceptance
- User sees only own orders from repository
- History and detail states persist after reload

---

## 3) Data Consistency and Migration

**Status:** In progress

### Pending Tasks
- [ ] Add one-time migration for legacy orders with outdated payment/status combinations
- [ ] Ensure status history and comments stay consistent for migrated records

### Acceptance
- Legacy incorrect statuses are normalized safely
- Migration does not duplicate history entries

---

## Priority Order

1. Orders Board Finalization
2. User Orders History Completion
3. Data Consistency and Migration
