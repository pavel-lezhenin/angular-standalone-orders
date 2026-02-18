# UI Decomposition Analysis

## Overview

Analysis of HTML templates in `src/areas` directory to identify code duplication and opportunities for extracting reusable UI components.

**Analysis Date:** February 16, 2026  
**Files Analyzed:** 36 HTML files

---

## Executive Summary

### Critical Findings

- **12 major UI patterns** with significant duplication
- **60+ instances** of repeated code blocks
- **Potential reduction:** ~40-50% of template code through decomposition
- **Priority areas:** Admin tables, form fields, dialogs, state components

---

## 1. Table Components (HIGH PRIORITY)

### 🔴 Current Duplication

**Affected Files:**
- `admin/products/product-table/product-table.component.html`
- `admin/customers/customer-table/customer-table.component.html`
- `admin/categories/category-table/category-table.component.html`

### Pattern Identified

All three tables share identical structure:

```html
<table mat-table [dataSource]="data()">
  <!-- Column definitions with ng-container -->
  
  <!-- Actions column with identical buttons -->
  <ng-container matColumnDef="actions">
    <th mat-header-cell *matHeaderCellDef>Actions</th>
    <td mat-cell *matCellDef="let item">
      @if (canEdit()) {
        <button mat-icon-button (click)="editClick.emit(item)" matTooltip="Edit">
          <mat-icon>edit</mat-icon>
        </button>
      }
      @if (canDelete()) {
        <button mat-icon-button color="warn" (click)="deleteClick.emit(item)" matTooltip="Delete">
          <mat-icon>delete</mat-icon>
        </button>
      }
    </td>
  </ng-container>

  <!-- No data row -->
  <tr class="mat-mdc-no-data-row" *matNoDataRow>
    <td [attr.colspan]="displayedColumns.length">No data found</td>
  </tr>
</table>

<mat-paginator
  [length]="total()"
  [pageSize]="pageSize()"
  [pageIndex]="currentPage() - 1"
  [pageSizeOptions]="pageSizeOptions()"
  (page)="pageChange.emit($event)"
  showFirstLastButtons
/>
```

### 💡 Recommended Component

**Component:** `shared/ui/data-table`

```typescript
@Component({
  selector: 'app-data-table',
  template: `
    <table mat-table [dataSource]="dataSource">
      <ng-content select="[tableColumns]"></ng-content>
      
      <!-- Generic actions column -->
      @if (showActions) {
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>{{ actionsLabel }}</th>
          <td mat-cell *matCellDef="let item">
            <ng-content select="[tableActions]" [ngTemplateOutletContext]="{$implicit: item}"></ng-content>
          </td>
        </ng-container>
      }
      
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      
      @if (showNoDataRow) {
        <tr class="mat-mdc-no-data-row" *matNoDataRow>
          <td [attr.colspan]="displayedColumns.length">{{ noDataMessage }}</td>
        </tr>
      }
    </table>
    
    @if (showPaginator) {
      <mat-paginator
        [length]="totalItems"
        [pageSize]="pageSize"
        [pageIndex]="currentPage - 1"
        [pageSizeOptions]="pageSizeOptions"
        (page)="pageChange.emit($event)"
        [showFirstLastButtons]="showFirstLastButtons"
      />
    }
  `
})
```

### Impact
- **Files affected:** 3
- **Lines saved:** ~150 lines
- **Maintenance:** Centralized table logic

---

## 2. Table Action Buttons (HIGH PRIORITY)

### 🔴 Current Duplication

**Identical pattern in:**
- Product table
- Customer table  
- Category table
- Order items cart

### Pattern Identified

```html
@if (canEdit()) {
  <button mat-icon-button (click)="editClick.emit(item)" matTooltip="Edit">
    <mat-icon>edit</mat-icon>
  </button>
}
@if (canDelete()) {
  <button mat-icon-button color="warn" (click)="deleteClick.emit(item)" matTooltip="Delete">
    <mat-icon>delete</mat-icon>
  </button>
}
```

### 💡 Recommended Component

**Component:** `shared/ui/table-action-buttons`

```typescript
@Component({
  selector: 'app-table-action-buttons',
  template: `
    @if (canEdit) {
      <button 
        mat-icon-button 
        [matTooltip]="editTooltip"
        (click)="edit.emit()">
        <mat-icon>{{ editIcon }}</mat-icon>
      </button>
    }
    @if (canDelete) {
      <button 
        mat-icon-button 
        color="warn"
        [matTooltip]="deleteTooltip"
        (click)="delete.emit()">
        <mat-icon>{{ deleteIcon }}</mat-icon>
      </button>
    }
    @if (canView) {
      <button 
        mat-icon-button 
        [matTooltip]="viewTooltip"
        (click)="view.emit()">
        <mat-icon>{{ viewIcon }}</mat-icon>
      </button>
    }
  `,
  inputs: {
    canEdit: true,
    canDelete: true,
    canView: false,
    editIcon: 'edit',
    deleteIcon: 'delete',
    viewIcon: 'visibility',
    editTooltip: 'Edit',
    deleteTooltip: 'Delete',
    viewTooltip: 'View'
  },
  outputs: {
    edit: new EventEmitter(),
    delete: new EventEmitter(),
    view: new EventEmitter()
  }
})
```

### Impact
- **Files affected:** 5
- **Lines saved:** ~50 lines
- **Consistency:** Uniform action buttons

---

## 3. Form Field with Validation (CRITICAL)

### 🔴 Current Duplication

**Massive duplication across:**
- `product-form-dialog.component.html` (10+ fields)
- `customer-form-dialog.component.html` (7+ fields)
- `category-form-dialog.component.html` (2+ fields)
- `checkout.component.html` (15+ fields)
- `lead-capture-form.component.html` (6+ fields)
- `login.component.html` (2+ fields)

### Pattern Identified

```html
<mat-form-field class="full-width">
  <mat-label>Product Name</mat-label>
  <input
    matInput
    formControlName="name"
    placeholder="Enter product name"
    required
  />
  @if (form.get('name')?.hasError('required')) {
    <mat-error>Product name is required</mat-error>
  }
  @if (form.get('name')?.hasError('maxlength')) {
    <mat-error>Maximum 200 characters allowed</mat-error>
  }
</mat-form-field>
```

### 💡 Recommended Component

**Component:** `shared/ui/form-field`

```typescript
@Component({
  selector: 'app-form-field',
  template: `
    <mat-form-field 
      [appearance]="appearance" 
      [class]="fieldClass">
      <mat-label>{{ label }}</mat-label>
      
      @if (prefixIcon) {
        <mat-icon matPrefix>{{ prefixIcon }}</mat-icon>
      }
      
      @if (type === 'textarea') {
        <textarea 
          matInput
          [formControl]="control"
          [placeholder]="placeholder"
          [rows]="rows"
          [maxlength]="maxLength"
          [required]="required"
        ></textarea>
      } @else if (type === 'select') {
        <mat-select [formControl]="control" [required]="required">
          <ng-content select="mat-option"></ng-content>
        </mat-select>
      } @else {
        <input
          matInput
          [type]="type"
          [formControl]="control"
          [placeholder]="placeholder"
          [maxlength]="maxLength"
          [required]="required"
        />
      }
      
      @if (suffixIcon) {
        <mat-icon matSuffix>{{ suffixIcon }}</mat-icon>
      }
      
      @if (hint) {
        <mat-hint [align]="hintAlign">{{ hint }}</mat-hint>
      }
      
      @if (showCharacterCount && maxLength) {
        <mat-hint align="end">{{ control.value?.length || 0 }}/{{ maxLength }}</mat-hint>
      }
      
      @if (control.invalid && control.touched) {
        <mat-error>{{ getErrorMessage() }}</mat-error>
      }
    </mat-form-field>
  `
})
```

### Impact
- **Files affected:** 10+
- **Lines saved:** ~400 lines
- **Consistency:** Uniform validation messages
- **Accessibility:** Standardized ARIA labels

---

## 4. Dialog Wrappers (HIGH PRIORITY)

### 🔴 Current Duplication

**Files with identical dialog structure:**
- `product-form-dialog.component.html`
- `customer-form-dialog.component.html`
- `category-form-dialog.component.html`

### Pattern Identified

```html
<h2 mat-dialog-title>{{ dialogTitle }}</h2>

<mat-dialog-content>
  <form [formGroup]="form">
    <!-- Form content -->
  </form>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button (click)="onCancel()" [disabled]="submitting">
    Cancel
  </button>
  <button 
    mat-raised-button 
    color="primary"
    (click)="onSubmit()"
    [disabled]="submitting || form.invalid">
    @if (submitting) {
      <mat-spinner diameter="20"></mat-spinner>
      <span>Saving...</span>
    } @else {
      <span>{{ isEditMode ? 'Update' : 'Create' }}</span>
    }
  </button>
</mat-dialog-actions>
```

**Note:** `app-dialog` component already exists and is used in 2 files, but NOT consistently across all dialogs!

### 💡 Recommendation

**Action:** Refactor remaining dialogs to use existing `app-dialog` component

Files to refactor:
1. `product-form-dialog.component.html` - Replace custom structure
2. Other dialogs not using `app-dialog`

### Impact
- **Files affected:** 3
- **Lines saved:** ~30 lines
- **Consistency:** All dialogs use same component

---

## 5. Empty State Components (MEDIUM PRIORITY)

### 🔴 Current Duplication

**Repeated pattern in:**
- `cart.component.html` (empty cart)
- `checkout.component.html` (empty cart)
- `order-confirmation.component.html` (error state)
- `shop-product-list.component.html` (no products)
- `order-history.component.html` (no orders)

### Pattern Identified

```html
<div class="empty-state">
  <mat-icon class="empty-icon">shopping_cart</mat-icon>
  <h2>Your cart is empty</h2>
  <p>Add some products to get started!</p>
  <button mat-raised-button color="primary" (click)="action()">
    Continue Shopping
  </button>
</div>
```

### 💡 Recommended Component

**Component:** `shared/ui/empty-state`

```typescript
@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state" [class]="stateClass">
      <mat-icon class="state-icon">{{ icon }}</mat-icon>
      <h2>{{ title }}</h2>
      @if (message) {
        <p>{{ message }}</p>
      }
      @if (actionLabel) {
        <button 
          mat-raised-button 
          [color]="actionColor"
          (click)="action.emit()">
          @if (actionIcon) {
            <mat-icon>{{ actionIcon }}</mat-icon>
          }
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  inputs: {
    icon: 'inbox',
    title: 'No data',
    message: '',
    actionLabel: '',
    actionIcon: '',
    actionColor: 'primary',
    stateClass: ''
  },
  outputs: {
    action: new EventEmitter()
  }
})
```

### Impact
- **Files affected:** 8
- **Lines saved:** ~80 lines
- **UX consistency:** Uniform empty states

---

## 6. Loading States (MEDIUM PRIORITY)

### 🔴 Current Duplication

**Repeated in:**
- `cart.component.html`
- `checkout.component.html`
- `order-confirmation.component.html`
- `payment.component.html`
- `dashboard.component.html`
- `orders-board.component.html`

### Pattern Identified

```html
<div class="processing-state">
  <mat-spinner diameter="60"></mat-spinner>
  <h2>Processing Payment...</h2>
  <p>Please wait while we process your payment. This may take a few seconds.</p>
</div>
```

**Note:** `app-page-loader` component EXISTS but is NOT used consistently!

### 💡 Recommendation

**Action:** Expand existing `app-page-loader` component and use it everywhere

```typescript
// Enhanced app-page-loader
@Component({
  selector: 'app-page-loader',
  template: `
    @if (isLoading) {
      <div class="loading-state" [class]="variant">
        <mat-spinner [diameter]="spinnerSize"></mat-spinner>
        @if (title) {
          <h2>{{ title }}</h2>
        }
        @if (message) {
          <p>{{ message }}</p>
        }
      </div>
    }
  `,
  inputs: {
    isLoading: true,
    title: '',
    message: '',
    spinnerSize: 40,
    variant: 'default' // 'default' | 'inline' | 'overlay'
  }
})
```

### Impact
- **Files affected:** 10+
- **Lines saved:** ~100 lines
- **Consistency:** Uniform loading states

---

## 7. Status Badges (MEDIUM PRIORITY)

### 🔴 Current Duplication

**Repeated pattern in:**
- `product-table.component.html` (stock status)
- `customer-table.component.html` (role badges)
- `order-confirmation.component.html` (order status)
- `order-history.component.html` (order status)
- `dashboard.component.html` (order status)

### Pattern Identified

```html
<mat-chip [class]="getStockBadgeClass(stock)">
  {{ getStockLabel(stock) }}
</mat-chip>
```

### 💡 Recommended Component

**Component:** `shared/ui/status-badge`

```typescript
@Component({
  selector: 'app-status-badge',
  template: `
    <mat-chip [class]="'status-' + variant">
      @if (icon) {
        <mat-icon>{{ icon }}</mat-icon>
      }
      {{ label }}
    </mat-chip>
  `,
  inputs: {
    label: string,
    variant: 'success' | 'warning' | 'error' | 'info' | 'neutral',
    icon: ''
  }
})
```

### Impact
- **Files affected:** 8
- **Lines saved:** ~40 lines
- **Design consistency:** Uniform status indicators

---

## 8. Section Headers with Icons (LOW PRIORITY)

### 🔴 Current Duplication

**Files with identical section headers:**
- `order-confirmation.component.html` (3 sections)
- `order-details-dialog.component.html` (2 sections)
- `payment.component.html` (1 section)

### Pattern Identified

```html
<h2>
  <mat-icon>local_shipping</mat-icon>
  Delivery Information
</h2>
```

### 💡 Recommended Component

**Component:** `shared/ui/section-header`

```typescript
@Component({
  selector: 'app-section-header',
  template: `
    <h2 [class]="headerClass">
      @if (icon) {
        <mat-icon>{{ icon }}</mat-icon>
      }
      {{ title }}
      @if (badge) {
        <span class="header-badge">{{ badge }}</span>
      }
    </h2>
    @if (subtitle) {
      <p class="section-subtitle">{{ subtitle }}</p>
    }
  `,
  inputs: {
    title: string,
    subtitle: '',
    icon: '',
    badge: '',
    headerClass: ''
  }
})
```

### Impact
- **Files affected:** 6
- **Lines saved:** ~30 lines

---

## 9. Quantity Controls (HIGH PRIORITY)

### 🔴 Current Duplication

**Exact duplication in:**
- `cart.component.html`

### Pattern Identified

```html
<div class="quantity-controls">
  <button 
    mat-icon-button 
    (click)="decreaseQuantity(item.productId, item.quantity)"
    [disabled]="item.quantity <= 1">
    <mat-icon>remove</mat-icon>
  </button>
  <span class="quantity">{{ item.quantity }}</span>
  <button 
    mat-icon-button 
    (click)="increaseQuantity(item.productId, item.quantity)">
    <mat-icon>add</mat-icon>
  </button>
</div>
```

### 💡 Recommended Component

**Component:** `shared/ui/quantity-control`

```typescript
@Component({
  selector: 'app-quantity-control',
  template: `
    <div class="quantity-controls" [class]="variant">
      <button 
        mat-icon-button 
        [disabled]="disabled || quantity <= min"
        (click)="decrement()">
        <mat-icon>{{ decrementIcon }}</mat-icon>
      </button>
      
      @if (editable) {
        <input 
          type="number" 
          [value]="quantity"
          [min]="min"
          [max]="max"
          (change)="onInputChange($event)"
        />
      } @else {
        <span class="quantity">{{ quantity }}</span>
      }
      
      <button 
        mat-icon-button 
        [disabled]="disabled || (max && quantity >= max)"
        (click)="increment()">
        <mat-icon>{{ incrementIcon }}</mat-icon>
      </button>
    </div>
  `,
  inputs: {
    quantity: 1,
    min: 1,
    max: null,
    disabled: false,
    editable: false,
    variant: 'default',
    decrementIcon: 'remove',
    incrementIcon: 'add'
  },
  outputs: {
    quantityChange: new EventEmitter<number>()
  }
})
```

### Impact
- **Files affected:** 1 (but highly reusable)
- **Lines saved:** ~15 lines
- **Reusability:** Can be used in product cards, cart, etc.

---

## 10. Order Summary Card (HIGH PRIORITY)

### 🔴 Current Duplication

**Repeated in:**
- `cart.component.html`
- `checkout.component.html`
- `payment.component.html`

### Pattern Identified

```html
<div class="order-summary">
  <h2>Order Summary</h2>
  
  <div class="summary-row">
    <span>Subtotal:</span>
    <span class="amount">{{ subtotal() | currency }}</span>
  </div>
  
  <div class="summary-row">
    <span>Tax (10%):</span>
    <span class="amount">{{ tax() | currency }}</span>
  </div>
  
  <div class="summary-divider"></div>
  
  <div class="summary-row total">
    <span>Total:</span>
    <span class="amount">{{ total() | currency }}</span>
  </div>
</div>
```

### 💡 Recommended Component

**Component:** `shared/ui/order-summary`

```typescript
@Component({
  selector: 'app-order-summary',
  template: `
    <div class="order-summary" [class]="variant">
      <h2>{{ title }}</h2>
      
      @for (line of summaryLines; track line.label) {
        <div class="summary-row" [class]="line.class">
          <span>{{ line.label }}:</span>
          <span class="amount">{{ line.value | currency }}</span>
        </div>
      }
      
      @if (showDivider) {
        <div class="summary-divider"></div>
      }
      
      <div class="summary-row total">
        <span>{{ totalLabel }}:</span>
        <span class="amount">{{ total | currency }}</span>
      </div>
      
      <ng-content></ng-content>
    </div>
  `,
  inputs: {
    title: 'Order Summary',
    summaryLines: Array<{label: string, value: number, class?: string}>,
    total: number,
    totalLabel: 'Total',
    showDivider: true,
    variant: 'default'
  }
})
```

### Impact
- **Files affected:** 3
- **Lines saved:** ~60 lines
- **Consistency:** Uniform order summaries

---

## 11. Icon Buttons with Tooltip (LOW PRIORITY)

### 🔴 Current Duplication

**Pattern repeated everywhere:**
- All table action columns
- Cart item remove buttons
- Form specification add/remove buttons
- Navigation buttons

### Pattern Identified

```html
<button 
  mat-icon-button 
  matTooltip="Edit product"
  (click)="editClick.emit(product.id)">
  <mat-icon>edit</mat-icon>
</button>
```

### 💡 Recommended Component

**Component:** `shared/ui/icon-button`

```typescript
@Component({
  selector: 'app-icon-button',
  template: `
    <button 
      [mat-icon-button]="variant === 'icon'"
      [mat-stroked-button]="variant === 'stroked'"
      [mat-raised-button]="variant === 'raised'"
      [color]="color"
      [disabled]="disabled"
      [matTooltip]="tooltip"
      [attr.aria-label]="ariaLabel || tooltip"
      (click)="clicked.emit()">
      <mat-icon>{{ icon }}</mat-icon>
      @if (label) {
        <span>{{ label }}</span>
      }
    </button>
  `,
  inputs: {
    icon: string,
    label: '',
    tooltip: '',
    ariaLabel: '',
    color: '',
    disabled: false,
    variant: 'icon' | 'stroked' | 'raised'
  },
  outputs: {
    clicked: new EventEmitter()
  }
})
```

### Impact
- **Files affected:** 15+
- **Lines saved:** ~100 lines
- **Accessibility:** Centralized ARIA labels

---

## 12. Card Grid Layouts (LOW PRIORITY)

### 🔴 Current Duplication

**Repeated in:**
- `features-section.component.html`
- `dashboard.component.html` (stats grid)

### Pattern Identified

```html
<div class="features-grid">
  <mat-card class="feature-card">
    <mat-icon class="feature-icon">inventory</mat-icon>
    <h3>Order Management</h3>
    <p>Track and manage orders...</p>
  </mat-card>
  <!-- Repeated for each card -->
</div>
```

### 💡 Recommended Component

**Component:** `shared/ui/icon-card`

```typescript
@Component({
  selector: 'app-icon-card',
  template: `
    <mat-card [class]="cardClass">
      @if (icon) {
        <mat-icon [class]="iconClass">{{ icon }}</mat-icon>
      }
      @if (title) {
        <h3>{{ title }}</h3>
      }
      @if (description) {
        <p>{{ description }}</p>
      }
      <ng-content></ng-content>
    </mat-card>
  `,
  inputs: {
    icon: '',
    title: '',
    description: '',
    cardClass: '',
    iconClass: 'card-icon'
  }
})
```

### Impact
- **Files affected:** 3
- **Lines saved:** ~40 lines

---

## Implementation Priority

> **Статус проверен:** 2026-02-18  
> Компоненты созданы, но **adoption** (реальное использование в шаблонах) не завершён.

### Phase 1: Critical (Week 1)
1. ✅ **Form Field Component** — создан, используется (6 мест)
2. ⬜ **Data Table Component** — НЕ создан (`src/shared/ui/data-table` отсутствует), 4 файла всё ещё используют сырой `mat-table`
3. ✅ **Table Action Buttons** — создан, используется (3 места)
4. ✅ **Order Summary Component** — создан, используется (6 мест)

### Phase 2: High Priority (Week 2)
5. ✅ **Empty State Component** — создан, используется (6 мест)
6. ✅ **Quantity Control** — создан, используется (1 место — нужно расширить)
7. ⬜ **Refactor Dialog Usage** — `app-dialog` существует, но не все диалоги его используют (проверить)
8. ✅ **Page Loader** — создан, используется (11 мест — хорошее покрытие)

### Phase 3: Medium Priority (Week 3)
9. ✅ **Status Badge Component** — создан, используется (2 места — нужно расширить)
10. ⬜ **Section Header Component** — НЕ создан (`src/shared/ui/section-header` отсутствует)

### Phase 4: Low Priority (Week 4)
11. ⬜ **Icon Button Component** — НЕ создан (`src/shared/ui/icon-button` отсутствует)
12. ⬜ **Icon Card Component** — НЕ создан

---

## 🔴 Открытые задачи (не закрыто)

### Не созданы компоненты:
- `shared/ui/data-table` — 4 файла всё ещё имеют сырой `mat-table`: `product-table`, `customer-table`, `category-table`, `permission-matrix`
- `shared/ui/section-header`
- `shared/ui/icon-button`
- `shared/ui/icon-card`

### Слабое adoption существующих компонентов:
- `app-quantity-control` — только 1 использование (ожидалось 3+)
- `app-status-badge` — только 2 использования (ожидалось 5+)
- `app-table-action-buttons` — только 3 использования (ожидалось 5+)

### Не проверено:
- Adoption `app-dialog` — нужно проверить сколько диалогов используют его vs сырой `MatDialog`


---

## Metrics & Impact

### Before Decomposition
- **Total template lines:** ~2,200 lines
- **Duplicated code:** ~40% (880 lines)
- **Component count:** 36 components

### After Decomposition (Estimated)
- **Total template lines:** ~1,300 lines (-41%)
- **Reusable UI components:** +12 components
- **Duplicated code:** <5% (~65 lines)
- **Maintenance effort:** -60%

### Benefits
- ✅ **Consistency:** Uniform UI patterns across entire app
- ✅ **Accessibility:** Centralized ARIA labels and keyboard navigation
- ✅ **Maintainability:** Single source of truth for common patterns
- ✅ **Testing:** Test once, use everywhere
- ✅ **Performance:** Smaller component trees
- ✅ **Developer Experience:** Faster feature development

---

## Detailed File Impact Map

### High Impact Files (10+ lines saved each)
1. `checkout.component.html` - **~150 lines** (15 form fields, loading states)
2. `product-form-dialog.component.html` - **~120 lines** (10 form fields, dialog)
3. `cart.component.html` - **~80 lines** (table, empty state, summary)
4. `customer-form-dialog.component.html` - **~70 lines** (7 form fields)
5. `product-table.component.html` - **~60 lines** (table structure)
6. `payment.component.html` - **~50 lines** (loading states, summary)
7. `login.component.html` - **~40 lines** (form fields)
8. `lead-capture-form.component.html` - **~40 lines** (form fields)

### Medium Impact Files (5-10 lines saved each)
- `customer-table.component.html`
- `category-table.component.html`
- `order-confirmation.component.html`
- `order-history.component.html`
- `shop-product-list.component.html`
- `dashboard.component.html`
- `orders-board.component.html`

### Low Impact Files (<5 lines saved each)
- `features-section.component.html`
- `faq-section.component.html`
- `hero-section.component.html`
- Other landing page sections

---

## Recommended File Structure

```
src/shared/ui/
├── buttons/
│   ├── icon-button/
│   └── table-action-buttons/
├── data-display/
│   ├── data-table/
│   ├── status-badge/
│   ├── icon-card/
│   └── order-summary/
├── forms/
│   ├── form-field/
│   └── quantity-control/
├── feedback/
│   ├── empty-state/
│   ├── page-loader/ (enhance existing)
│   └── error-state/
├── layout/
│   └── section-header/
└── dialogs/
    └── dialog/ (enhance existing app-dialog)
```

---

## Testing Strategy

Each new component should include:
1. **Unit tests** - Component logic and inputs/outputs
2. **Integration tests** - Usage in consuming components
3. **Accessibility tests** - ARIA labels, keyboard navigation
4. **Visual regression tests** - Screenshot comparisons

---

## Migration Path

### Step 1: Create Components (Don't break anything)
- Create all new UI components in `shared/ui`
- Add comprehensive tests
- Document usage in Storybook

### Step 2: Migrate One Area at a Time
- Start with **Admin area** (highest impact)
- Then **Orders area**
- Then **Shop area**
- Finally **Landing area**

### Step 3: Verify & Cleanup
- Run full test suite
- Visual regression testing
- Remove old duplicated code
- Update documentation

---

## Success Criteria

- ✅ All identified duplications eliminated
- ✅ Test coverage >90% for new components
- ✅ No visual regressions
- ✅ Storybook documentation complete
- ✅ Performance metrics maintained or improved
- ✅ Bundle size reduction (target: -10%)

---

## Notes

1. Some components like `app-dialog` and `app-page-loader` ALREADY EXIST but are not used consistently - these should be enhanced and adopted everywhere
2. The `app-filter-container` and `app-search-input` components are already well-abstracted
3. Focus on high-impact wins first (form fields, tables)
4. Consider creating a UI component library monorepo package for future reuse across projects

---

## Questions for Review

1. Should we create a separate `@shared/ui-kit` package?
2. What's the timeline for implementation?
3. Are there business constraints on changing existing UIs?
4. Should we include animation/transition standardization?
5. Do we need design system documentation (Figma integration)?

---

**End of Analysis**
