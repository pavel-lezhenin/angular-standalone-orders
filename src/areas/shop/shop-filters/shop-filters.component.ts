import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoryDTO } from '@core';

export interface ShopFilters {
  search: string;
  categoryId?: string;
}

/**
 * Shop filters component (presentational)
 *
 * Handles search and category filtering for public catalog
 * Emits filter changes to parent orchestrator
 */
@Component({
  selector: 'app-shop-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './shop-filters.component.html',
  styleUrl: './shop-filters.component.scss',
})
export class ShopFiltersComponent {
  readonly categories = input.required<CategoryDTO[]>();

  readonly searchControl = new FormControl('');
  readonly categoryControl = new FormControl<string>('');

  readonly filtersChange = output<ShopFilters>();

  constructor() {
    // Debounce search input
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.emitFilters());

    // Immediate category filter
    this.categoryControl.valueChanges.subscribe(() => this.emitFilters());
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      search: this.searchControl.value || '',
      categoryId: this.categoryControl.value || undefined,
    });
  }
}
