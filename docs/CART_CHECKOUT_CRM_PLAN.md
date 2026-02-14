# Cart & Checkout Flow - Complete CRM Implementation Plan

**Goal:** Full-featured e-commerce order processing system with payment simulation, order tracking, and admin management.

**Duration:** ~12-15 hours  
**Priority:** HIGH

---

## 📋 Overview

Transform current basic cart/checkout into comprehensive order management system:

- ✅ Cart with item selection (checkboxes)
- ✅ Payment information collection (Card, PayPal, COD)
- ✅ Bank payment simulation (approval/decline flow)
- ✅ Extended order statuses (7-stage workflow)
- ✅ Supplier management (delivery tracking)
- ✅ Admin Kanban board (drag-drop order management)

---

## 🎯 Phase 1: Enhanced Cart Component (~2h)

### 1.1 Add Item Selection
- [ ] Add checkbox column to cart table
- [ ] "Select All" checkbox in header
- [ ] Track selected items in signal
- [ ] Calculate totals only for selected items
- [ ] Disable checkout if no items selected

### 1.2 Update Cart Interface
```typescript
interface CartItemWithSelection extends CartItemWithDetails {
  selected: boolean; // New field
}
```

### 1.3 Update Cart Summary
- [ ] Show count of selected items
- [ ] Update subtotal calculation
- [ ] Show warning if trying to checkout with nothing selected

**Files to modify:**
- `src/areas/shop/cart/cart.component.ts`
- `src/areas/shop/cart/cart.component.html`
- `src/areas/shop/cart/cart.component.scss`

---

## 🎯 Phase 2: Payment Information Collection (~3h)

### 2.1 Create Payment Form Component
Create `src/shared/ui/payment-form/payment-form.component.ts`

**Features:**
- Card number input (with formatting: **** **** **** 4242)
- Expiry date (MM/YY dropdown)
- CVV input (3-4 digits, masked)
- Cardholder name
- Payment method selector (Card / PayPal / Cash on Delivery)
- Form validation (Luhn algorithm for card, expiry date validation)

### 2.2 Update Checkout Component
- [ ] Add payment form section
- [ ] Integrate PaymentFormComponent
- [ ] Collect payment data in checkout
- [ ] Validate before order submission

**Validation Rules:**
- Card: Luhn algorithm check
- CVV: 3-4 digits
- Expiry: Future date only
- Cardholder: Required, min 3 chars

**Files to create:**
- `src/shared/ui/payment-form/payment-form.component.ts|html|scss`

**Files to modify:**
- `src/areas/shop/checkout/checkout.component.ts|html`

---

## 🎯 Phase 3: Payment Processing Simulation (~2h)

### 3.1 Create Payment Service
Create `src/shared/services/payment.service.ts`

**Methods:**
```typescript
interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

async processPayment(request: PaymentRequestDTO): Promise<PaymentResult>
```

**Simulation Logic:**
- Random 2-3 second delay (bank processing)
- 90% success rate simulation
- Generate transaction ID on success
- Error messages on failure ("Insufficient funds", "Card declined", etc.)

### 3.2 Payment UI States
- [ ] Show loading spinner during payment
- [ ] Show processing message
- [ ] Handle approval (green checkmark, success message)
- [ ] Handle decline (red X, error message, retry button)

### 3.3 Update Checkout Flow
```
1. Fill address → 2. Fill payment → 3. Click "Place Order"
   ↓
4. Validate forms → 5. Process payment (simulated)
   ↓
6a. Payment approved → Create order → Redirect to confirmation
6b. Payment declined → Show error → Allow retry
```

**Files to create:**
- `src/shared/services/payment.service.ts`

**Files to modify:**
- `src/areas/shop/checkout/checkout.component.ts|html|scss`

---

## 🎯 Phase 4: Extended Order Statuses (~1.5h)

### 4.1 Update Order Status Workflow

**New Statuses (7 stages):**
1. `pending_payment` - Customer hasn't paid yet
2. `paid` - Payment confirmed by bank
3. `warehouse` - Order being prepared
4. `courier_pickup` - Courier collected from warehouse
5. `in_transit` - On the way to customer
6. `delivered` - Successfully delivered
7. `cancelled` - Order cancelled (by user or admin)

### 4.2 Status Color Coding
```scss
.status-pending_payment { background: #fef3c7; color: #92400e; } // Yellow
.status-paid           { background: #dbeafe; color: #1e40af; } // Blue
.status-warehouse      { background: #e0e7ff; color: #3730a3; } // Indigo
.status-courier_pickup { background: #fce7f3; color: #9f1239; } // Pink
.status-in_transit     { background: #c7d2fe; color: #4338ca; } // Purple
.status-delivered      { background: #d1fae5; color: #065f46; } // Green
.status-cancelled      { background: #fee2e2; color: #991b1b; } // Red
```

### 4.3 Update Components
- [ ] Order confirmation page
- [ ] Orders list page
- [ ] Admin orders board

**Files to modify:**
- `src/areas/shop/order-confirmation/order-confirmation.component.scss`
- `src/areas/orders/components/orders.component.ts` (inline styles)

---

## 🎯 Phase 5: Supplier Management (~2.5h)

### 5.1 Create Supplier Model (Already Done ✅)
- BFF Model: `src/bff/models/supplier.ts`
- BFF Repository needed

### 5.2 Create Supplier Repository
Create `src/bff/repositories/supplier.repository.ts`

**CRUD Operations:**
- create(supplier)
- getAll()
- getById(id)
- update(id, data)
- delete(id)
- getActive() // Only active suppliers

### 5.3 Admin Supplier Management Page
Create `src/areas/admin/suppliers/*`

**Features:**
- Suppliers table (name, contact, phone, delivery time)
- CRUD operations
- Active/Inactive toggle
- Filter by active/inactive

### 5.4 Seed Supplier Data
Update `src/bff/services/seed.service.ts`

**Demo Suppliers:**
- FastShip Express (deliveryTimeHours: 24)
- CityLogistics (deliveryTimeHours: 48)
- GlobalTransport (deliveryTimeHours: 72)

### 5.5 Assign Supplier on Order Creation
- [ ] Randomly assign supplier when order created
- [ ] Calculate estimatedDeliveryDate based on supplier.deliveryTimeHours
- [ ] Store supplierId in order

**Files to create:**
- `src/bff/repositories/supplier.repository.ts`
- `src/areas/admin/suppliers/suppliers.component.ts|html|scss`
- `src/areas/admin/suppliers/services/supplier.service.ts`
- `src/areas/admin/suppliers/model/types.ts`

**Files to modify:**
- `src/bff/database.service.ts` (add suppliers store)
- `src/bff/services/seed.service.ts`
- `src/shared/services/order.service.ts` (supplier assignment)

---

## 🎯 Phase 6: Admin Orders Board - Kanban (~4h)

### 6.1 Install Dependencies
```bash
cd packages/angular-standalone-orders
pnpm add @angular/cdk
```

### 6.2 Create Kanban Board Component
Create `src/areas/admin/orders-board/orders-board.component.ts`

**Layout:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│              │              │              │              │              │              │              │
│  Pending     │   Paid       │  Warehouse   │  Courier     │  In Transit  │  Delivered   │  Cancelled   │
│  Payment     │              │              │  Pickup      │              │              │              │
│  (3)         │  (5)         │  (8)         │  (2)         │  (12)        │  (45)        │  (1)         │
│              │              │              │              │              │              │              │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │ Order    │ │ │ Order    │ │ │ Order    │ │ │ Order    │ │ │ Order    │ │ │ Order    │ │ │ Order    │ │
│ │ #12345   │ │ │ #12346   │ │ │ #12347   │ │ │ #12348   │ │ │ #12349   │ │ │ #12350   │ │ │ #12351   │ │
│ │ $150     │ │ │ $200     │ │ │ $350     │ │ │ $180     │ │ │ $220     │ │ │ $190     │ │ │ $100     │ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │
│              │              │              │              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

### 6.3 Implement Drag-Drop
**CDK DragDrop:**
```typescript
import { CdkDragDrop, moveItemInArray, transferArrayBetween } from '@angular/cdk/drag-drop';

drop(event: CdkDragDrop<OrderDTO[]>, newStatus: OrderStatus) {
  // Transfer order between columns
  // Update order status in repository
}
```

### 6.4 Features
- [ ] 7 columns (one per status)
- [ ] Drag orders between columns
- [ ] Update status on drop
- [ ] Order count per column
- [ ] Order card shows: ID, total, customer name, delivery date
- [ ] Click card to view details (modal)
- [ ] Filters: date range, customer search, supplier
- [ ] Responsive: horizontal scroll on mobile

### 6.5 Permissions
- **Manager:** Can drag orders, update statuses
- **Admin:** Full access
- **User:** Cannot access

**Files to create:**
- `src/areas/admin/orders-board/orders-board.component.ts|html|scss`
- `src/areas/admin/orders-board/services/orders-board.service.ts`
- `src/areas/admin/orders-board/components/order-card/order-card.component.ts|html|scss`
- `src/areas/admin/orders-board/components/order-detail-modal/order-detail-modal.component.ts|html|scss`

**Files to modify:**
- `src/areas/admin/admin.routes.ts`
- `src/areas/admin/admin-layout.component.ts` (add menu item)

---

## 🎯 Phase 7: Integration & Testing (~2h)

### 7.1 End-to-End Flow Testing
**User Flow:**
1. Browse shop → Add products to cart
2. View cart → Select items (checkboxes)
3. Checkout → Fill address + payment
4. Submit → Payment processing (2s delay)
5. Payment approved → Order created (status: paid)
6. Cart cleared → Redirect to confirmation
7. View in Orders page

**Manager Flow:**
1. Login as manager@demo
2. Navigate to Orders Board
3. Drag order from "Paid" to "Warehouse"
4. Drag to "Courier Pickup"
5. Continue through workflow
6. Mark as "Delivered"

### 7.2 Edge Cases
- [ ] Payment declined → Show error, allow retry
- [ ] Empty cart checkout → Block
- [ ] No payment method selected → Validation error
- [ ] Invalid card number → Luhn check fails
- [ ] Expired card → Validation error

### 7.3 Unit Tests
- [ ] PaymentService.processPayment()
- [ ] Cart selection logic
- [ ] Order status transitions
- [ ] Supplier assignment

---

## 📦 Files Summary

### To Create (18 files)
```
src/shared/ui/payment-form/
  payment-form.component.ts
  payment-form.component.html
  payment-form.component.scss

src/shared/services/
  payment.service.ts

src/bff/repositories/
  supplier.repository.ts

src/areas/admin/suppliers/
  suppliers.component.ts
  suppliers.component.html
  suppliers.component.scss
  services/supplier.service.ts
  model/types.ts

src/areas/admin/orders-board/
  orders-board.component.ts
  orders-board.component.html
  orders-board.component.scss
  services/orders-board.service.ts
  components/order-card/order-card.component.ts|html|scss
  components/order-detail-modal/order-detail-modal.component.ts|html|scss
```

### To Modify (12 files)
```
src/areas/shop/cart/
  cart.component.ts
  cart.component.html
  cart.component.scss

src/areas/shop/checkout/
  checkout.component.ts
  checkout.component.html
  checkout.component.scss

src/areas/shop/order-confirmation/
  order-confirmation.component.scss

src/areas/orders/components/
  orders.component.ts

src/areas/admin/
  admin.routes.ts
  admin-layout.component.ts

src/bff/
  database.service.ts

src/bff/services/
  seed.service.ts
```

---

## 🎯 Priority Order

**High Priority (Must Have):**
1. ✅ Phase 1: Enhanced Cart (checkboxes) - 2h
2. ✅ Phase 2: Payment Form - 3h
3. ✅ Phase 3: Payment Simulation - 2h
4. ✅ Phase 5: Suppliers (basic) - 2.5h

**Medium Priority (Should Have):**
5. ✅ Phase 4: Extended Statuses - 1.5h
6. ✅ Phase 6: Admin Kanban - 4h

**Nice to Have:**
7. ✅ Phase 7: Testing & Polish - 2h

---

## 🚀 Getting Started

1. Review this plan
2. Confirm approach and priorities
3. Start with Phase 1 (Enhanced Cart)
4. Implement phases sequentially
5. Test after each phase

**Estimated Total:** 15 hours for complete implementation

**Questions before starting?**
