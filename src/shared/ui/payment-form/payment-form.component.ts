import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent, type SelectOption } from '../form-field/form-field.component';

/**
 * Payment Form Component (Dumb UI)
 * 
 * Pure presentation component for card payment fields.
 * Reusable across different payment contexts (checkout, account settings).
 * 
 * Features:
 * - Card number formatting (4-4-4-4)
 * - Cardholder name input
 * - Expiry month/year selectors
 * - Optional CVV field (checkout)
 * - Optional Label field (account settings)
 * 
 * This is a DUMB component:
 * - Receives FormGroup via input
 * - NO validation logic (parent responsibility)
 * - NO form creation (parent responsibility)
 * - Pure presentation only
 */
@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFormComponent {
  // ============================================
  // Inputs
  // ============================================

  /**
   * FormGroup containing card fields:
   * - cardNumber: string
   * - cardholderName: string
   * - expiryMonth: string
   * - expiryYear: string
   * - cvv?: string (optional, controlled by showCvv)
   * - label?: string (optional, controlled by showLabel)
   */
  readonly formGroup = input.required<FormGroup>();

  /**
   * Show CVV field (checkout flow only)
   */
  readonly showCvv = input<boolean>(false);

  /**
   * Show Label field (account settings only)
   */
  readonly showLabel = input<boolean>(false);

  /**
   * Enable real-time card number formatting with spaces
   */
  readonly enableFormatting = input<boolean>(true);

  // ============================================
  // Data
  // ============================================

  /**
   * Month options (01-12)
   */
  readonly months: SelectOption[] = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });

  /**
   * Year options (current year + 15 years)
   */
  readonly years: SelectOption[] = (() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 16 }, (_, i) => {
      const year = currentYear + i;
      return { value: year.toString(), label: year.toString() };
    });
  })();

  // ============================================
  // Methods
  // ============================================

  /**
   * Format card number as user types (4-4-4-4)
   * Only if enableFormatting is true
   */
  formatCardNumber(event: Event): void {
    if (!this.enableFormatting()) return;

    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, ''); // Remove spaces

    // Only allow digits
    value = value.replace(/\D/g, '');

    // Limit to 16 digits
    value = value.substring(0, 16);

    // Add space every 4 digits
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;

    this.formGroup().patchValue({ cardNumber: formatted }, { emitEvent: false });
    input.value = formatted;
  }

  /**
   * Get FormControl by name with type safety
   */
  getControl(name: string): FormControl {
    return this.formGroup().get(name) as FormControl;
  }
}
