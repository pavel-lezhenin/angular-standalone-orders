# SearchInputComponent Documentation

## Overview

`SearchInputComponent` is a reusable, Material Design-based search input field used across the application. It provides consistent search experience with built-in 300ms debounce to prevent excessive API calls.

## Features

- ✅ Material Design input field with `mat-form-field`
- ✅ Configurable debounce time (default: 300ms)
- ✅ Clear button that appears when user types
- ✅ Search icon (Material Icons)
- ✅ Customizable label and placeholder
- ✅ Output events for search and clear actions
- ✅ Fully accessible with ARIA labels

## Usage

### Basic Example

```typescript
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchInputComponent } from '@shared/ui/search-input';

@Component({
  selector: 'app-my-filter',
  imports: [SearchInputComponent],
  template: `
    <app-search-input
      [label]="'Search products'"
      [placeholder]="'Search by name...'"
      [formControl]="searchControl"
      (search)="onSearch($event)"
      (clear)="onSearchClear()"
    />
  `,
})
export class MyFilterComponent {
  readonly searchControl = new FormControl<string>('');

  onSearch(searchValue: string): void {
    console.log('Search for:', searchValue);
    // Make API call or filter results
  }

  onSearchClear(): void {
    console.log('Search cleared');
    // Reset filters
  }
}
```

## Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | `'Search'` | Label text displayed in the form field |
| `placeholder` | `string` | `'Search...'` | Placeholder text in the input |
| `debounceMs` | `number` | `300` | Debounce time in milliseconds |
| `searchControl` | `FormControl<string \| null>` | **required** | Form control for the input |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `search` | `string` | Emitted after debounce time with the search value |
| `clear` | `void` | Emitted when the clear button is clicked |

## Implementation Details

### Debounce Mechanism

The component uses RxJS `debounceTime` and `distinctUntilChanged` operators to:
1. Wait 300ms (configurable) before emitting search events
2. Prevent duplicate values from being emitted
3. Reduce API calls and improve performance

### Clear Button

The clear button only appears when the input has a value (`*ngIf="currentValue"`).

## Integration in Filter Components

### Example: Shop Filters

```typescript
@Component({
  selector: 'app-shop-filters',
  imports: [SearchInputComponent, MatSelectModule, ...],
})
export class ShopFiltersComponent {
  readonly searchControl = new FormControl<string>('');
  readonly categoryControl = new FormControl<string | undefined>(undefined);

  readonly filtersChange = output<ShopFilters>();

  onSearch(searchValue: string): void {
    this.searchControl.setValue(searchValue, { emitEvent: false });
    this.emitFilters();
  }

  onSearchClear(): void {
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      search: this.searchControl.value || '',
      categoryId: this.categoryControl.value,
    });
  }
}
```

```html
<div class="filters">
  <div class="filters-row">
    <app-search-input
      [label]="'Search products'"
      [placeholder]="'Search by name...'"
      [formControl]="searchControl"
      (search)="onSearch($event)"
      (clear)="onSearchClear()"
    />

    <mat-form-field appearance="outline" class="category-field">
      <mat-label>Category</mat-label>
      <mat-select [formControl]="categoryControl">
        <mat-option [value]="undefined">All Categories</mat-option>
        <mat-option *ngFor="let category of categories()" [value]="category.id">
          {{ category.name }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <button mat-stroked-button (click)="clearFilters()">
      <mat-icon>refresh</mat-icon>
      Reset
    </button>
  </div>
</div>
```

## Components Using SearchInputComponent

1. **ShopFiltersComponent** (`src/areas/shop/shop-filters/`)
   - Search products in shop catalog
   - Debounce: 300ms (default)

2. **ProductFiltersComponent** (`src/areas/admin/products/product-filters/`)
   - Search admin products
   - Debounce: 300ms (default)

3. **CustomerFiltersComponent** (`src/areas/admin/customers/customer-filters/`)
   - Search customers/users
   - Debounce: 300ms (default)

## Styling

The component uses CSS variables from the design system:
- Background: `var(--surface-primary)`
- Text color: `var(--text-primary)`
- Focus color: `var(--app-primary)`
- Border: `var(--color-border)`

## Accessibility

- ✅ Proper `<label>` association via Material form field
- ✅ `aria-label` on clear button
- ✅ Keyboard navigation support
- ✅ Screen reader friendly

## Performance

- 300ms debounce prevents excessive API calls
- `distinctUntilChanged()` prevents duplicate requests
- Form control value changes don't emit events during component updates (`emitEvent: false`)

## Customization

To use a different debounce time:

```html
<app-search-input
  [debounceMs]="500"
  [formControl]="searchControl"
  (search)="onSearch($event)"
/>
```

## File Locations

- Component: `src/shared/ui/search-input/search-input.component.ts`
- Template: `src/shared/ui/search-input/search-input.component.html`
- Styles: `src/shared/ui/search-input/search-input.component.scss`
- Export: `src/shared/ui/search-input/index.ts`
- UI Index: `src/shared/ui/index.ts`
