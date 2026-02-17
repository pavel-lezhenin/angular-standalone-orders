import { Component, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AccountPaymentFormComponent } from '../account-payment-form/account-payment-form.component';
import { PaymentMethodSelectorComponent } from '../payment-method-selector/payment-method-selector.component';
import type { PaymentMethodDTO } from '@core/models';

/**
 * Saved Payment Methods Manager Component
 * 
 * Manages user's saved payment methods with selection, addition, and deletion
 */
@Component({
  selector: 'app-saved-payment-methods-manager',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    AccountPaymentFormComponent,
    PaymentMethodSelectorComponent,
  ],
  templateUrl: './saved-payment-methods-manager.component.html',
  styleUrl: './saved-payment-methods-manager.component.scss',
})
export class SavedPaymentMethodsManagerComponent {
  /**
   * List of saved payment methods
   */
  readonly savedPaymentMethods = input.required<PaymentMethodDTO[]>();

  /**
   * Currently selected payment method ID
   */
  readonly selectedPaymentMethodId = input.required<string>();

  /**
   * Whether to show the add payment method form
   */
  readonly showPaymentMethodForm = input.required<boolean>();

  /**
   * Payment method form group
   */
  readonly paymentMethodForm = input.required<FormGroup>();

  /**
   * Selected payment method type ('card' or 'paypal')
   */
  readonly selectedPaymentType = input.required<'card' | 'paypal'>();

  /**
   * Whether the account is in edit mode
   */
  readonly isEditMode = input.required<boolean>();

  /**
   * Emitted when payment method selection changes
   */
  readonly paymentMethodSelectionChange = output<string>();

  /**
   * Emitted when user wants to toggle the payment method form
   */
  readonly toggleForm = output<void>();

  /**
   * Emitted when user wants to toggle edit mode
   */
  readonly toggleEditMode = output<void>();

  /**
   * Emitted when user changes the payment type
   */
  readonly paymentTypeChange = output<'card' | 'paypal'>();

  /**
   * Emitted when user wants to save a new payment method
   */
  readonly savePaymentMethod = output<void>();

  /**
   * Emitted when user wants to delete selected payment method
   */
  readonly deleteSelected = output<void>();

  /**
   * Emitted when user wants to set selected payment method as default
   */
  readonly setAsDefault = output<void>();
}
