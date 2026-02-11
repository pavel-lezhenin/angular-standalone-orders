import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UserRole } from '@core/types';

export interface CustomerFilters {
  search: string;
  role?: UserRole;
}

/**
 * Customer filters component
 * 
 * Handles search and role filtering
 * Emits filter changes to parent
 */
@Component({
  selector: 'app-customer-filters',
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
  templateUrl: './customer-filters.component.html',
  styleUrl: './customer-filters.component.scss',
})
export class CustomerFiltersComponent {
  readonly searchControl = new FormControl('');
  readonly roleControl = new FormControl<UserRole | undefined>(undefined);

  readonly filtersChange = output<CustomerFilters>();

  constructor() {
    // Debounce search input
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.emitFilters());

    // Immediate role filter
    this.roleControl.valueChanges.subscribe(() => this.emitFilters());
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.roleControl.setValue(undefined);
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      search: this.searchControl.value || '',
      role: this.roleControl.value || undefined,
    });
  }
}
