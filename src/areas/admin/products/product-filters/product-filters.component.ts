import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CategoryDTO } from '@core';
import { SearchInputComponent } from '@shared/ui/search-input';
import { FilterContainerComponent, FilterAction } from '@shared/ui/filter-container';
import { FormFieldComponent, type SelectOption } from '@shared/ui/form-field/form-field.component';

export interface ProductFilters {
  search: string;
  categoryId?: string;
}

/**
 * Product filters component
 *
 * Handles search and category filtering
 * Uses reusable SearchInputComponent with 300ms debounce
 * Uses FilterContainerComponent for responsive layout
 * Emits filter changes to parent
 */
@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchInputComponent,
    FilterContainerComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    FormFieldComponent,
  ],
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFiltersComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = input.required<CategoryDTO[]>();
  readonly isLoading = input<boolean>(false);

  readonly categorySelectOptions = computed<SelectOption[]>(() => [
    { value: undefined, label: 'All Categories' },
    ...this.categories().map(c => ({ value: c.id, label: c.name })),
  ]);

  readonly searchControl = new FormControl<string>('');
  readonly categoryControl = new FormControl<string | undefined>(undefined);

  readonly filtersChange = output<ProductFilters>();

  readonly filterActions = signal<FilterAction[]>([
    {
      id: 'reset',
      icon: 'close',
      ariaLabel: 'Clear filters',
      tooltip: 'Clear all filters',
    },
    {
      id: 'refresh',
      icon: 'refresh',
      ariaLabel: 'Refresh results',
      tooltip: 'Refresh with current filters',
    },
  ]);

  constructor() {
    // Immediate category filter
    this.categoryControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitFilters());
  }

  /**
   * Handle search input with debounce (300ms)
   * Called by SearchInputComponent after debounce time
   */
  onSearch(searchValue: string): void {
    this.searchControl.setValue(searchValue, { emitEvent: false });
    this.emitFilters();
  }

  /**
   * Handle search clear button
   */
  onSearchClear(): void {
    this.emitFilters();
  }

  /**
   * Handle filter action (reset, refresh, etc)
   */
  onFilterAction(actionId: string): void {
    if (actionId === 'reset') {
      this.resetFilters();
    } else if (actionId === 'refresh') {
      this.emitFilters();
    }
  }

  resetFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.categoryControl.setValue(undefined, { emitEvent: false });
    this.filtersChange.emit({
      search: '',
      categoryId: undefined,
    });
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      search: this.searchControl.value || '',
      categoryId: this.categoryControl.value || undefined,
    });
  }
}
