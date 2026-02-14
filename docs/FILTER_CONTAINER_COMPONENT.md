# FilterContainerComponent Documentation

## Overview

`FilterContainerComponent` is a reusable, Material Design-based filter container that provides:
- Responsive grid layout (4 columns desktop, 2 tablet, 1 mobile)
- Icon-based action buttons (reset, export, etc)
- Loading/disabled states to prevent duplicate submissions
- Consistent styling across the application

## Features

✅ Responsive grid layout with CSS variables
✅ Icon-based action buttons with tooltips
✅ Disabled state during loading
✅ ARIA labels for accessibility
✅ Content projection for flexible field placement
✅ Animated loading indicator on buttons

## Layout

### Desktop (4 columns)
```
[Field 1] [Field 2] [Field 3] [Field 4]
[Field 5] [Field 6]
    [Reset Button] [Export Button]
```

### Tablet (2 columns)
```
[Field 1] [Field 2]
[Field 3] [Field 4]
[Field 5] [Field 6]
    [Reset] [Export]
```

### Mobile (1 column)
```
[Field 1]
[Field 2]
[Field 3]
[Field 4]
[Reset] [Export]
```

## Usage

### Basic Example

```typescript
import { FilterContainerComponent, FilterAction } from '@shared/ui/filter-container';
import { signal } from '@angular/core';

@Component({
  selector: 'app-my-filters',
  imports: [FilterContainerComponent, ...],
  template: `
    <app-filter-container
      [isLoading]="isLoading()"
      [actions]="filterActions()"
      (action)="onFilterAction($event)"
    >
      <app-search-input
        [searchControl]="searchControl"
        (search)="onSearch($event)"
      />

      <mat-form-field appearance="outline">
        <mat-label>Category</mat-label>
        <mat-select [formControl]="categoryControl">
          <mat-option *ngFor="let cat of categories()" [value]="cat.id">
            {{ cat.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </app-filter-container>
  `,
})
export class MyFiltersComponent {
  readonly isLoading = input<boolean>(false);
  readonly searchControl = new FormControl<string>('');
  readonly categoryControl = new FormControl<string>();

  readonly filterActions = signal<FilterAction[]>([
    {
      id: 'reset',
      icon: 'refresh',
      ariaLabel: 'Reset filters',
      tooltip: 'Reset all filters',
    },
    {
      id: 'export',
      icon: 'download',
      ariaLabel: 'Export results',
      tooltip: 'Export filtered results',
    },
  ]);

  onFilterAction(actionId: string): void {
    if (actionId === 'reset') {
      this.resetFilters();
    } else if (actionId === 'export') {
      this.exportResults();
    }
  }
}
```

## Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `isLoading` | `boolean` | `false` | Disable all actions when true |
| `actions` | `FilterAction[]` | `[]` | Array of action buttons |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `action` | `string` | Action ID emitted when button clicked |

## FilterAction Interface

```typescript
export interface FilterAction {
  // Unique identifier for the action
  id: string;
  
  // Material Icon name (e.g., 'refresh', 'download')
  icon: string;
  
  // Optional tooltip text
  tooltip?: string;
  
  // ARIA label for accessibility
  ariaLabel: string;
  
  // Optional disabled state
  disabled?: boolean;
}
```

## Implementation in Filter Components

### Shop Filters
Location: `src/areas/shop/shop-filters/`

```typescript
readonly filterActions = signal<FilterAction[]>([
  {
    id: 'reset',
    icon: 'refresh',
    ariaLabel: 'Reset filters',
    tooltip: 'Reset all filters to default',
  },
]);

onFilterAction(actionId: string): void {
  if (actionId === 'reset') {
    this.clearFilters();
  }
}
```

### Product Filters
Location: `src/areas/admin/products/product-filters/`

Similar implementation to shop filters.

### Customer Filters
Location: `src/areas/admin/customers/customer-filters/`

Similar implementation to shop filters.

## Responsive Behavior

The grid automatically adjusts based on screen size using `:host-context()` selectors:

- `.mobile` - 1 column, buttons stretch full width
- `.tablet` - 2 columns
- `.desktop` - 4 columns

## Styling

FilterContainerComponent uses CSS variables from the design system:

- Background: `var(--surface-secondary)`
- Padding: `var(--spacing-md)`
- Gap: `var(--spacing-md)`
- Border radius: `var(--border-radius-md)`

## Loading State

When `isLoading` is true:
- All action buttons are disabled
- Buttons have reduced opacity (0.5)
- Reset icon has spinning animation
- Cursor shows as `not-allowed`

## Accessibility

- ✅ Proper ARIA labels on all buttons
- ✅ Tooltips for additional context
- ✅ Keyboard navigation support
- ✅ Disabled state clearly indicated

## Performance

- Minimal re-renders using Angular signals
- Efficient event binding
- No unnecessary change detection

## File Locations

- Component: `src/shared/ui/filter-container/filter-container.component.ts`
- Template: `src/shared/ui/filter-container/filter-container.component.html`
- Styles: `src/shared/ui/filter-container/filter-container.component.scss`
- Export: `src/shared/ui/filter-container/index.ts`
- UI Index: `src/shared/ui/index.ts`

## See Also

- [SearchInputComponent Documentation](./SEARCH_INPUT_COMPONENT.md)
- Shop Filters: `src/areas/shop/shop-filters/`
- Product Filters: `src/areas/admin/products/product-filters/`
- Customer Filters: `src/areas/admin/customers/customer-filters/`
