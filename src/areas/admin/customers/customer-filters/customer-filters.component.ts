import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserRole } from '@core/types';
import { SearchInputComponent } from '@shared/ui/search-input';

export interface CustomerFilters {
  search: string;
  role?: UserRole;
}

/**
 * Customer filters component
 * 
 * Handles search and role filtering
 * Uses reusable SearchInputComponent with 300ms debounce
 * Emits filter changes to parent
 */
@Component({
  selector: 'app-customer-filters',
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
  templateUrl: './customer-filters.component.html',
  styleUrl: './customer-filters.component.scss',
})
export class CustomerFiltersComponent {
  readonly searchControl = new FormControl<string>('');
  readonly roleControl = new FormControl<UserRole | undefined>(undefined);

  readonly filtersChange = output<CustomerFilters>();

  constructor() {
    // Immediate role filter
    this.roleControl.valueChanges.subscribe(() => this.emitFilters());
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

  resetFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.roleControl.setValue(undefined, { emitEvent: false });
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      search: this.searchControl.value || '',
      role: this.roleControl.value || undefined,
    });
  }
}
