# FilterContainerComponent

Reusable Material filter container with:
- Actions bar at top (reset, export, etc)
- Responsive grid: 4 cols (desktop), 2 (tablet), 1 (mobile)
- Icon buttons with tooltips
- Loading state support

## Usage

```typescript
@Component({
  selector: 'app-my-filters',
  imports: [FilterContainerComponent],
  template: `
    <app-filter-container
      [isLoading]="isLoading()"
      [actions]="filterActions()"
      (action)="onFilterAction($event)"
    >
      <app-search-input [searchControl]="searchControl" (search)="onSearch($event)" />
      <mat-form-field>
        <mat-label>Category</mat-label>
        <mat-select [formControl]="categoryControl" />
      </mat-form-field>
    </app-filter-container>
  `,
})
export class MyFiltersComponent {
  readonly filterActions = signal<FilterAction[]>([
    {
      id: 'reset',
      icon: 'restart_alt',
      ariaLabel: 'Reset filters',
      tooltip: 'Reset all filters',
    },
  ]);

  onFilterAction(actionId: string): void {
    if (actionId === 'reset') this.resetFilters();
  }
}
```

## API

**Inputs:**
- `isLoading: boolean` - Disable actions during loading
- `actions: FilterAction[]` - Array of action buttons

**Output:**
- `action: string` - Action ID when button clicked

**FilterAction Interface:**
```typescript
interface FilterAction {
  id: string;              // unique identifier
  icon: string;            // Material Icon name
  ariaLabel: string;       // accessibility label
  tooltip?: string;        // optional tooltip
  disabled?: boolean;      // optional disabled state
}
```

