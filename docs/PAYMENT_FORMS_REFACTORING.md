# Payment Forms Refactoring

> **Problem:** Code duplication between payment form implementations with unclear responsibility boundaries.

**Status:** 🔴 Open — Requires refactoring  
**Priority:** High  
**Estimated Effort:** 4-6 hours  
**Related Issues:** Orders area decomposition (see PHASE2_PLAN.md)

---

## 🔴 Problem Statement

Currently, the application has **two payment form implementations** with significant code duplication:

1. **`shared/ui/payment-form/`** — Smart component for checkout flow
2. **`areas/account/ui/payment-method-form/`** — Dumb component for account settings

Both components share **~60% identical code**:
- Card number input with formatting
- Cardholder name input
- Expiry month/year selectors
- Validation logic
- Card number formatting utilities

This violates **DRY principle** and creates maintenance issues.

---

## 📊 Current State Analysis

### Component 1: PaymentFormComponent (shared/ui/payment-form/)

**Location:** `src/shared/ui/payment-form/payment-form.component.ts` (270 lines)

**Responsibility:**
- ✅ Checkout payment collection
- ✅ Supports: Card, PayPal, COD
- ✅ Creates own FormGroup (Smart component)
- ✅ Includes "Save method" checkbox
- ✅ CVV validation

**Architecture Pattern:** Smart component

**Usage:**
```typescript
// Used in: orders/payment/payment.component.ts
<app-payment-form 
  [availableMethods]="availableMethods()"
  (formSubmit)="handlePaymentSubmit($event)"
/>
```

**Key Code:**
```typescript
export class PaymentFormComponent {
  protected readonly paymentForm = this.fb.group({
    method: ['card', Validators.required],
    cardNumber: ['', [Validators.required, this.cardNumberValidator()]],
    cardholderName: ['', Validators.required],
    expiryMonth: ['', Validators.required],
    expiryYear: ['', Validators.required],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    paypalEmail: [''],
    shouldSaveMethod: [false]
  });

  formatCardNumber(control: AbstractControl) { /* ... */ }
  cardNumberValidator(): ValidatorFn { /* ... */ }
  getFormData() { /* ... */ }
}
```

---

### Component 2: PaymentMethodFormComponent (areas/account/ui/)

**Location:** `src/areas/account/ui/saved-payment-methods-list/payment-method-form/payment-method-form.component.ts` (85 lines)

**Responsibility:**
- ✅ Account settings payment method management
- ✅ Supports: Card, PayPal
- ✅ Receives FormGroup via input (Dumb component)
- ✅ Includes "Label" field
- ❌ No CVV field

**Architecture Pattern:** Dumb component

**Usage:**
```typescript
// Used in: account/ui/saved-payment-methods-manager/
<app-payment-method-form
  [formGroup]="methodForm"
  (save)="onSave($event)"
  (cancel)="onCancel()"
/>
```

**Key Code:**
```typescript
export class PaymentMethodFormComponent {
  formGroup = input.required<FormGroup>();
  
  // NO form creation logic - receives FormGroup
  // NO validation logic - parent handles it
  // Only presentation + events
}
```

---

## 🔍 Duplication Analysis

### Shared Elements (60% overlap)

| Element | PaymentForm | PaymentMethodForm | Notes |
|---------|-------------|-------------------|-------|
| Card number input | ✅ | ✅ | Same formatting logic |
| Cardholder name | ✅ | ✅ | Identical |
| Expiry month | ✅ | ✅ | Same month list |
| Expiry year | ✅ | ✅ | Same year calculation |
| Card type detection | ✅ | ✅ | Visa/MC/AmEx/Discover |
| Validation | ✅ | ✅ | Luhn algorithm |
| PayPal email | ✅ | ✅ | Same pattern |

### Unique Elements (40% difference)

| Element | PaymentForm | PaymentMethodForm | Reason |
|---------|-------------|-------------------|--------|
| CVV field | ✅ | ❌ | Checkout only |
| Label field | ❌ | ✅ | Account only |
| COD option | ✅ | ❌ | Checkout only |
| "Save method" checkbox | ✅ | ❌ | Checkout only |
| Form ownership | Creates own | Receives via input | Architecture pattern |

---

## ✅ Proposed Solution

### Architecture: Layered Component Approach

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Shared UI (Dumb)                                    │
│ └── shared/ui/payment-card-fields/                           │
│     • Pure presentation component                             │
│     • Receives FormGroup via input                            │
│     • Optional: showCvv, showLabel inputs                     │
│     • NO form creation, NO business logic                     │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ uses
                            │
        ┌───────────────────┴────────────────────┐
        │                                        │
┌───────────────────────┐          ┌─────────────────────────┐
│ Layer 2: Domain Smart │          │ Layer 2: Domain Dumb    │
│ orders/ui/payment/    │          │ account/ui/method/      │
│ payment-form          │          │ payment-method-form     │
├───────────────────────┤          ├─────────────────────────┤
│ • Creates FormGroup   │          │ • Receives FormGroup    │
│ • Uses card-fields    │          │ • Uses card-fields      │
│ • + Method selector   │          │ • + Type selector       │
│ • + Save checkbox     │          │ • + Label field         │
│ • Checkout logic      │          │ • Save/cancel events    │
└───────────────────────┘          └─────────────────────────┘
```

### Component Responsibilities

#### 1. shared/ui/payment-card-fields/ (NEW)

**Type:** Dumb UI Component  
**Purpose:** Pure presentation of payment card input fields

**Interface:**
```typescript
export class PaymentCardFieldsComponent {
  // Required
  formGroup = input.required<FormGroup>();
  
  // Optional
  showCvv = input<boolean>(false);
  showLabel = input<boolean>(false);
  
  // Internal
  protected readonly months = MONTHS;
  protected readonly years = this.generateYears();
  
  // Utils (can be extracted to service later)
  formatCardNumber(control: AbstractControl): void { /* ... */ }
  detectCardType(cardNumber: string): string { /* ... */ }
}
```

**Template includes:**
- Card number input (formatted)
- Cardholder name input
- Expiry month selector
- Expiry year selector
- CVV input (conditional via `showCvv`)
- Label input (conditional via `showLabel`)

**Does NOT include:**
- Form creation
- Validation logic (parent responsibility)
- Payment method selection
- Save/cancel buttons

---

#### 2. areas/orders/ui/payment-form/ (Refactored)

**Type:** Smart Component  
**Purpose:** Checkout payment collection with orchestration

**Changes:**
```typescript
export class PaymentFormComponent {
  // CREATE own FormGroup
  protected readonly paymentForm = this.fb.group({
    method: ['card', Validators.required],
    // Card fields group - passed to payment-card-fields
    cardFields: this.fb.group({
      cardNumber: ['', [Validators.required, this.cardNumberValidator()]],
      cardholderName: ['', Validators.required],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    }),
    paypalEmail: [''],
    shouldSaveMethod: [false]
  });
  
  // Use in template:
  // <app-payment-card-fields 
  //   [formGroup]="paymentForm.get('cardFields')"
  //   [showCvv]="true"
  // />
}
```

**Template includes:**
- Payment method radio group (Card/PayPal/COD)
- `<app-payment-card-fields>` for card
- PayPal email input (conditional)
- "Save method" checkbox
- Submit button

---

#### 3. areas/account/ui/payment-method-form/ (Refactored)

**Type:** Dumb Component  
**Purpose:** Account payment method form wrapper

**Changes:**
```typescript
export class PaymentMethodFormComponent {
  // RECEIVE FormGroup from parent
  formGroup = input.required<FormGroup>();
  
  save = output<void>();
  cancel = output<void>();
  
  // Parent creates FormGroup with structure:
  // {
  //   type: 'card' | 'paypal',
  //   cardFields: { cardNumber, cardholderName, expiryMonth, expiryYear, label },
  //   paypalEmail: ''
  // }
  
  // Use in template:
  // <app-payment-card-fields 
  //   [formGroup]="formGroup().get('cardFields')"
  //   [showLabel]="true"
  // />
}
```

**Template includes:**
- Type selector (Card/PayPal)
- `<app-payment-card-fields>` for card
- PayPal email input (conditional)
- Save/Cancel buttons

---

## 🛠️ Refactoring Plan

### Step 1: Create Shared Component

**Task:** Create `shared/ui/payment-card-fields/`

**Files to create:**
- `payment-card-fields.component.ts`
- `payment-card-fields.component.html`
- `payment-card-fields.component.scss`
- `payment-card-fields.component.spec.ts`
- `payment-card-fields.stories.ts`

**Extract from:**
- Card input logic from `PaymentFormComponent`
- Validation utilities (Luhn algorithm)
- Formatting logic
- Month/year generation

**Inputs:**
```typescript
formGroup: InputSignal<FormGroup>;     // Required
showCvv: InputSignal<boolean>;         // Default: false
showLabel: InputSignal<boolean>;       // Default: false
```

---

### Step 2: Refactor orders/payment-form

**Task:** Refactor `PaymentFormComponent` to use `payment-card-fields`

**Changes:**
1. Import `PaymentCardFieldsComponent`
2. Restructure form to have nested `cardFields` group
3. Replace card input HTML with `<app-payment-card-fields>`
4. Keep method selector, save checkbox, submit logic
5. Update tests

**Testing:**
- Verify form submission works
- Check CVV validation
- Test "Save method" checkbox
- Verify PayPal/COD flow

---

### Step 3: Refactor account/payment-method-form

**Task:** Refactor `PaymentMethodFormComponent` to use `payment-card-fields`

**Changes:**
1. Import `PaymentCardFieldsComponent`
2. Update parent component to create form with nested structure
3. Replace card input HTML with `<app-payment-card-fields>`
4. Keep type selector, save/cancel buttons
5. Update tests

**Testing:**
- Verify form receives FormGroup correctly
- Check Label field appears
- Test save/cancel events
- Verify type switching works

---

### Step 4: Extract Validation Service (Optional)

**Task:** Create `shared/services/card-validation.service.ts`

**Methods:**
```typescript
export class CardValidationService {
  validateCardNumber(cardNumber: string): boolean;
  detectCardType(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' | null;
  formatCardNumber(value: string): string;
  validateCvv(cvv: string, cardType: string): boolean;
}
```

**Benefits:**
- Testable in isolation
- Reusable across app
- Easier to maintain

---

## 📋 Checklist

- [ ] **Step 1:** Create `shared/ui/payment-card-fields/` component
  - [ ] Component logic
  - [ ] Template
  - [ ] Styles
  - [ ] Unit tests
  - [ ] Storybook stories
  
- [ ] **Step 2:** Refactor `orders/ui/payment-form/`
  - [ ] Restructure FormGroup
  - [ ] Replace template with new component
  - [ ] Update tests
  - [ ] Verify checkout flow
  
- [ ] **Step 3:** Refactor `account/ui/payment-method-form/`
  - [ ] Update parent FormGroup structure
  - [ ] Replace template with new component
  - [ ] Update tests
  - [ ] Verify account settings flow
  
- [ ] **Step 4 (Optional):** Extract validation service
  - [ ] Create service
  - [ ] Move validation logic
  - [ ] Update components to use service
  - [ ] Add service tests

- [ ] **Step 5:** Cleanup
  - [ ] Remove duplicated code
  - [ ] Update documentation
  - [ ] Verify no regressions

---

## 🔗 Related Issues

### Orders Area Decomposition

**Context:** The `orders` domain currently lacks proper decomposition, mixing concerns.

**Impact on this refactoring:**
- `PaymentFormComponent` currently in `shared/ui/` should move to `areas/orders/ui/`
- Payment form is **checkout-specific**, not truly shared across domains
- After refactoring, consider moving to proper domain folder

**Recommendation:**
1. Complete payment forms refactoring first (shared UI extraction)
2. Then tackle orders area decomposition
3. Move `PaymentFormComponent` to `areas/orders/ui/payment/`

See **PHASE2_PLAN.md** and **UI_DECOMPOSITION_ANALYSIS.md** for more context.

---

## 📚 Design System Alignment

### CSS Variables Usage

All styling must use CSS variables from design system:

**Spacing:** `--spacing-xs` through `--spacing-7xl`  
**Colors:** `--app-primary`, `--text-primary`, `--surface-primary`  
**Typography:** `--font-size-2xs` through `--font-size-6xl`

**Responsive:** Use `:host-context(.mobile|.tablet|.desktop)` classes

See: `src/styles/variables/` and `.github/copilot-instructions.md`

---

## 🎯 Success Criteria

**Code Quality:**
- ✅ No duplicated card input logic
- ✅ Single source of truth for card validation
- ✅ Clear component responsibility boundaries
- ✅ All tests passing (>90% coverage)

**Architecture:**
- ✅ Dumb UI component in `shared/ui/`
- ✅ Smart orchestration in domain (orders)
- ✅ Dumb wrapper in domain (account)
- ✅ Proper layer separation (UI → Domain)

**Functionality:**
- ✅ Checkout flow works unchanged
- ✅ Account settings work unchanged
- ✅ CVV validation in checkout only
- ✅ Label field in account only
- ✅ No regressions in existing features

**Maintenance:**
- ✅ Future card field changes require single update
- ✅ Validation logic centralized
- ✅ Formatting utilities reusable
- ✅ Storybook documentation complete

---

## 📝 Notes

**Created:** February 17, 2026  
**Last Updated:** February 17, 2026  
**Author:** AI Coding Agent  
**Status:** Open — Awaiting development time allocation

**Complexity Estimate:** Medium  
**Risk Level:** Low (well-isolated change)  
**Dependencies:** None (can be done independently)

**Next Action:** Schedule refactoring sprint after orders decomposition planning is complete.
