import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoryDTO } from '@core';

export interface ProductFilters {
  search: string;
  categoryId?: string;
}

/**
 * Product filters component
 *
 * Handles search and category filtering
 * Emits filter changes to parent
 */
@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
})
export class ProductFiltersComponent {
  readonly categories = input.required<CategoryDTO[]>();

  readonly searchControl = new FormControl('');
  readonly categoryControl = new FormControl<string | undefined>(undefined);

  readonly filtersChange = output<ProductFilters>();

  constructor() {
    // Debounce search input
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.emitFilters());

    // Immediate category filter
    this.categoryControl.valueChanges.subscribe(() => this.emitFilters());
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.categoryControl.setValue(undefined);
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      search: this.searchControl.value || '',
      categoryId: this.categoryControl.value || undefined,
    });
  }
}
