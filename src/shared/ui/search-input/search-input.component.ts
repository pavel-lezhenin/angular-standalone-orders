import { ChangeDetectionStrategy, Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FormControl} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * Reusable search input component with Material Design and debounce
 * 
 * Provides consistent search experience across the application
 * with 300ms debounce by default to prevent excessive API calls
 * 
 * @example
 * <app-search-input
 *   [placeholder]="'Search products...'"
 *   [searchControl]="searchControl"
 *   (search)="onSearch($event)"
 * />
 */
@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  /**
   * Placeholder text for the search input
   * @default 'Search...'
   */
  readonly placeholder = input<string>('Search...');

  /**
   * Label text displayed in the form field
   * @default 'Search'
   */
  readonly label = input<string>('Search');

  /**
   * Debounce time in milliseconds
   * @default 300
   */
  readonly debounceMs = input<number>(600);

  /**
   * Form control for the search input (required)
   */
  readonly searchControl = input.required<FormControl<string | null>>();

  /**
   * Output event emitted after debounce time with search value
   */
  readonly searchChange = output<string>();

  /**
   * Output event emitted when clear button is clicked
   */
  readonly clear = output<void>();

  constructor() {
    // Setup debounce effect when input becomes available
    effect((onCleanup) => {
      const control = this.searchControl();
      const debounceMs = this.debounceMs();

      // Setup subscription to form control value changes
      const subscription = control.valueChanges
        .pipe(debounceTime(debounceMs), distinctUntilChanged())
        .subscribe((value) => {
          this.searchChange.emit(value || '');
        });

      onCleanup(() => {
        subscription.unsubscribe();
      });
    });
  }

  /**
   * Clear search input and emit clear event
   */
  onClear(): void {
    this.searchControl().setValue('');
    this.clear.emit();
  }

  /**
   * Get current search value
   */
  get currentValue(): string {
    return this.searchControl().value || '';
  }
}
