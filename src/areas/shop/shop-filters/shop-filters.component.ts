import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryDTO } from '@core';
import { SearchInputComponent } from '@shared/ui/search-input';

export interface ShopFilters {
  search: string;
  categoryId?: string;
}

/**
 * Shop filters component (presentational)
 *
 * Handles search and category filtering for public catalog
 * Uses reusable SearchInputComponent with 300ms debounce
 * Emits filter changes to parent orchestrator
 */
@Component({
  selector: 'app-shop-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchInputComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './shop-filters.component.html',
  styleUrl: './shop-filters.component.scss',
})
export class ShopFiltersComponent {
  readonly categories = input.required<CategoryDTO[]>();

  readonly searchControl = new FormControl<string>('');
  readonly categoryControl = new FormControl<string | undefined>(undefined);

  readonly filtersChange = output<ShopFilters>();

  constructor() {
    // Category filter changes emit immediately
    this.categoryControl.valueChanges.subscribe(() => this.emitFilters());
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
   * Clear all filters
   */
  clearFilters(): void {
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
