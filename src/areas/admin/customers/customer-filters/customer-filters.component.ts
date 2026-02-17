import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { UserRole } from '@core/types';
import { SearchInputComponent } from '@shared/ui/search-input';
import { FilterContainerComponent, FilterAction } from '@shared/ui/filter-container';
import { FormFieldComponent } from '@shared/ui/form-field/form-field.component';

export interface CustomerFilters {
  search: string;
  role?: UserRole;
}

/**
 * Customer filters component
 * 
 * Handles search and role filtering
 * Uses reusable SearchInputComponent with 300ms debounce
 * Uses FilterContainerComponent for responsive layout
 * Emits filter changes to parent
 */
@Component({
  selector: 'app-customer-filters',
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
  templateUrl: './customer-filters.component.html',
  styleUrl: './customer-filters.component.scss',
})
export class CustomerFiltersComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = input<boolean>(false);

  readonly searchControl = new FormControl<string>('');
  readonly roleControl = new FormControl<UserRole | undefined>(undefined);

  readonly filtersChange = output<CustomerFilters>();

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
    // Immediate role filter
    this.roleControl.valueChanges
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
    this.roleControl.setValue(undefined, { emitEvent: false });
    this.filtersChange.emit({
      search: '',
      role: undefined,
    });
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      search: this.searchControl.value || '',
      role: this.roleControl.value || undefined,
    });
  }
}
