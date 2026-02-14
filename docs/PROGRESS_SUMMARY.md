# Progress Summary — Remaining Scope

**Angular Orders Management Platform** — Active backlog only

**Last Updated:** 2026-02-14

---

## Current Focus

1. **Orders Board Finalization**
2. **User Orders History Completion**
3. **Data Consistency and Migration**

---

## Remaining Work Snapshot

### 1) Orders Board Finalization (In Progress)
- [ ] Transition rules for status moves (block invalid jumps)
- [ ] Quick manager actions in order details (template notes)
- [ ] Better customer metadata on board cards

### 2) User Orders History Completion (In Progress)
- [ ] Align history statuses with current domain workflow
- [ ] Dedicated order details entrypoint from history list
- [ ] Cancel action for eligible statuses only
- [ ] Pagination for larger histories

### 3) Data Consistency and Migration (In Progress)
- [ ] One-time migration for legacy status/payment mismatches
- [ ] Preserve consistency of `statusHistory` and `comments`

---

## Scope Decisions

- Supplier management is intentionally excluded.
- Testing and quality tracking is handled in a separate workstream/document.

---

## Related Docs

- [Implementation Backlog](./IMPLEMENTATION.md)
- [Cart Checkout CRM Plan](./CART_CHECKOUT_CRM_PLAN.md)
- [Project Status](./PROJECT_STATUS.md)
