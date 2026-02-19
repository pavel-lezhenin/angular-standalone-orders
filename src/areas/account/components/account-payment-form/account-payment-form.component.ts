import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FormFieldComponent, type SelectOption } from '@shared/ui/form-field/form-field.component';

/**
 * Account Payment Form Component (Dumb)
 *
 * Account settings payment method form wrapper.
 *
 * Features:
 * - Payment type selection (Card/PayPal)
 * - Card fields: cardholderName, cardNumber, expiryMonth/Year
 * - Label field for naming saved methods
 * - No CVV field (not needed for saved methods)
 * - Save/Cancel actions
 *
 * TODO (TD): Replace duplicated card fields with shared PaymentFormComponent
 * using [showLabel]="true" [showCvv]="false" to eliminate DRY violation.
 *
 * This is a DUMB component:
 * - Receives FormGroup via input
 * - NO validation logic (parent responsibility)
 * - Domain-specific (account settings)
 */
@Component({
  selector: 'app-account-payment-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, FormFieldComponent],
  templateUrl: './account-payment-form.component.html',
  styleUrl: './account-payment-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPaymentFormComponent {
  /**
   * Payment method form group
   */
  readonly paymentMethodForm = input.required<FormGroup>();

  /**
   * Currently selected payment type ('card' or 'paypal')
   */
  readonly selectedPaymentType = input.required<'card' | 'paypal'>();

  /**
   * Event emitted when payment type changes
   */
  readonly paymentTypeChange = output<'card' | 'paypal'>();

  /**
   * Event emitted when form is saved
   */
  readonly savePayment = output<void>();

  /**
   * Event emitted when form is canceled
   */
  readonly cancelPayment = output<void>();

  /**
   * Payment type select options
   */
  readonly paymentTypeOptions: SelectOption[] = [
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'paypal', label: 'PayPal' },
  ];

  /**
   * Month select options (01-12)
   */
  readonly monthOptions: SelectOption[] = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1).padStart(2, '0'),
  }));

  /**
   * Generates array of years from current year to +10 years
   */
  get yearOptions(): SelectOption[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => ({
      value: currentYear + i,
      label: String(currentYear + i),
    }));
  }

  /**
   * Helper method to get typed FormControl from form group
   */
  protected getControl(name: string): FormControl {
    const control = this.paymentMethodForm().get(name);
    if (!control) {
      console.error(`Control '${name}' not found in payment method form`);
      return new FormControl();
    }
    return control as FormControl;
  }
}
