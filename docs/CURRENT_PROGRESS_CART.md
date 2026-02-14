# Current Implementation Status - Cart, Checkout & Payment CRM

**Date:** 2026-02-14  
**Progress:** Cart + Checkout + Payment + Account Preferences — functional

---

## ✅ Implemented (Current Fact)

### Cart & Checkout
- ✅ Cart restore race fixed (`waitForRestore` + `hasLoaded` gating)
- ✅ Empty-state flicker removed on reload
- ✅ Guest checkout (account creation + auto-login)
- ✅ Auth checkout with saved addresses flow
- ✅ Address selection UX: default preselect + explicit “Add new address”
- ✅ Selected shipping address does not auto-change default

### Payment Flow
- ✅ Dedicated route: `/orders/payment`
- ✅ Pending payment state service between checkout and payment
- ✅ Simulated processing service with success/failure states
- ✅ Order creation happens only after successful payment
- ✅ Saved payment methods selector + add new + delete
- ✅ Prevent deleting only default payment method
- ✅ Ability to set selected payment method as default in account
- ✅ Deduplication of saved methods (card/paypal)
- ✅ Fixed logic: saved PayPal no longer requires CVV

### Account Preferences
- ✅ Multiple addresses (select/add/delete/set default)
- ✅ Multiple payment methods (select/add/delete/set default)
- ✅ Delete buttons disabled when deleting the only default item is not allowed

### BFF / Data Layer
- ✅ Normalized stores for `addresses` and `payment_methods`
- ✅ New handlers + repositories + routes in FakeBFF
- ✅ Legacy profile address/payment fields removed from DTO/domain profile
- ✅ Baseline order status audit trail (`statusHistory`: who + when + from/to)

### Status Workflow Note
- `pending_payment` is preserved as a reserved stage for asynchronous/custom payment processing flows.
- Manager board may hide this column in daily operations while the domain status remains available for integrations.

---

## 🔎 Current Known Limitations

- ⏳ No dedicated automated tests yet for new payment/preferences scenarios
- ⏳ Checkout currently clears full cart after successful payment (no partial selected-items clear)
- ⏳ UI/visual polish for account/payment controls deferred

---

## 🧪 Recommended Smoke Checks

1. Guest: cart → checkout → payment → confirmation
2. Auth user with saved addresses: switch address (default unchanged)
3. Add new address in checkout and verify it appears in account
4. Payment with saved card and with new card
5. Delete default payment method when single (button disabled)
6. Delete default payment method when multiple (fallback default assigned)

---

## 📊 Progress Snapshot

- **Cart/Checkout core:** 100%
- **Payment integration:** 100%
- **Account address/payment management:** 100%
- **Tests for this slice:** ~20% (needs expansion)

**Current milestone:** End-to-end checkout→payment→confirmation working with normalized preferences.
