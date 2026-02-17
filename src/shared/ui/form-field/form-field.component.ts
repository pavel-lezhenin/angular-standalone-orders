import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Option item for select-type form fields
 */
export interface SelectOption {
  /** Option value */
  value: unknown;
  /** Display label */
  label: string;
}

/**
 * Reusable form field component with validation support
 * 
 * Provides consistent form field experience across the application
 * with automatic error message display and character counting.
 * 
 * Supports multiple input types:
 * - text, email, password, number, tel, url
 * - textarea for multiline input
 * - select for dropdown options
 * 
 * @example
 * <app-form-field
 *   [label]="'Email'"
 *   [control]="emailControl"
 *   [type]="'email'"
 *   [placeholder]="'user@example.com'"
 *   [prefixIcon]="'email'"
 *   [required]="true"
 * />
 * 
 * @example
 * <app-form-field
 *   [label]="'Name'"
 *   [control]="myForm.controls['name']"
 * />
 * 
 * @example
 * <app-form-field
 *   [label]="'Description'"
 *   [control]="descriptionControl"
 *   [type]="'textarea'"
 *   [rows]="4"
 *   [maxLength]="500"
 *   [showCharacterCount]="true"
 * />
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
  ],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent {
  /**
   * Label text displayed above the input
   */
  readonly label = input.required<string>();

  /**
  * Form control for the input (required)
   */
  readonly control = input.required<FormControl>();

  /**
   * Input type
   * @default 'text'
   */
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select'>('text');

  /**
   * Placeholder text
   */
  readonly placeholder = input<string>('');

  /**
   * CSS class to apply to the form field
   */
  readonly fieldClass = input<string>('');

  /**
   * Prefix icon (Material icon name)
   */
  readonly prefixIcon = input<string>('');

  /**
   * Suffix icon (Material icon name)
   */
  readonly suffixIcon = input<string>('');

  /**
   * Hint text displayed below the input
   */
  readonly hint = input<string>('');

  /**
   * Hint text alignment
   * @default 'start'
   */
  readonly hintAlign = input<'start' | 'end'>('start');

  /**
   * Whether the field is required
   */
  readonly required = input<boolean>(false);

  /**
   * Maximum character length
   */
  readonly maxLength = input<number | null>(null);

  /**
   * Minimum value for number inputs
   */
  readonly min = input<number | null>(null);

  /**
   * Maximum value for number inputs
   */
  readonly max = input<number | null>(null);

  /**
   * Step value for number inputs
   */
  readonly step = input<number | null>(null);

  /**
   * Number of rows for textarea
   * @default 3
   */
  readonly rows = input<number>(3);

  /**
   * Show character count for inputs with maxLength
   * @default false
   */
  readonly showCharacterCount = input<boolean>(false);

  /**
   * Autocomplete attribute value
   */
  readonly autocomplete = input<string>('');

  /**
   * ARIA label for accessibility
   */
  readonly ariaLabel = input<string>('');

  /**
   * Whether the field is readonly
   * @default false
   */
  readonly readonly = input<boolean>(false);

  /**
   * Options for select-type fields
   * Required when type is 'select'
   */
  readonly selectOptions = input<SelectOption[]>([]);

  /**
   * Custom error messages map
   * Key is the error type, value is the error message
   */
  readonly customErrorMessages = input<Record<string, string>>({});

  /**
   * Event emitted when input value changes (for formatting, etc.)
   */
  readonly inputChange = output<Event>();

  /**
   * Event emitted when select value changes
   */
  readonly selectionChange = output<{ value: unknown }>();

  /**
   * Character count text
   */
  characterCountText(): string {
    const maxLen = this.maxLength();
    if (!maxLen) return '';
    const currentLength = this.control().value?.length || 0;
    return `${currentLength}/${maxLen}`;
  }

  /**
   * Handle input/change events and update control value
   */
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const ctrl = this.control();
    if (ctrl) {
      ctrl.setValue(target.value);
    }
    this.inputChange.emit(event);
  }

  /**
   * Handle blur events and mark control as touched
   */
  onBlur(): void {
    const ctrl = this.control();
    if (ctrl) {
      ctrl.markAsTouched();
    }
  }

  /**
   * Handle mat-select selection change
   */
  onSelectionChange(value: any): void {
    const ctrl = this.control();
    if (ctrl) {
      ctrl.setValue(value);
      ctrl.markAsTouched();
    }
  }

  /**
   * Gets the appropriate error message for the current validation error
   */
  getErrorMessage(): string {
    const ctrl = this.control();
    const customMessages = this.customErrorMessages();

    if (!ctrl.errors) return '';

    // Check custom messages first
    for (const errorType in ctrl.errors) {
      if (customMessages[errorType]) {
        return customMessages[errorType];
      }
    }

    // Default error messages
    if (ctrl.hasError('required')) {
      return `${this.label()} is required`;
    }

    if (ctrl.hasError('email')) {
      return 'Enter a valid email address';
    }

    if (ctrl.hasError('minlength')) {
      const minLength = ctrl.errors['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }

    if (ctrl.hasError('maxlength')) {
      const maxLength = ctrl.errors['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }

    if (ctrl.hasError('min')) {
      const min = ctrl.errors['min'].min;
      return `Value must be at least ${min}`;
    }

    if (ctrl.hasError('max')) {
      const max = ctrl.errors['max'].max;
      return `Value must be at most ${max}`;
    }

    if (ctrl.hasError('pattern')) {
      return 'Invalid format';
    }

    // Generic error message
    return 'Invalid value';
  }
}
