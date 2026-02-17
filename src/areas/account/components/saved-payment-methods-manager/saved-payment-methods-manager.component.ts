import { Component, input, output, computed, effect } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormFieldComponent } from '@shared/ui/form-field/form-field.component';
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
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    FormFieldComponent,
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
   * FormControl for payment method selection (wrapper for app-form-field)
   */
  readonly paymentMethodSelectControl = new FormControl('');

  /**
   * FormControl for payment type selection (wrapper for app-form-field)
   */
  readonly paymentTypeSelectControl = new FormControl<'card' | 'paypal'>('card');

  /**
   * Selected payment method computed from ID
   */
  readonly selectedPaymentMethod = computed(() => {
    const methods = this.savedPaymentMethods();
    return methods.find(method => method.id === this.selectedPaymentMethodId()) ?? null;
  });

  /**
   * Whether the selected payment method can be deleted
   */
  readonly canDeleteSelected = computed(() => {
    const method = this.selectedPaymentMethod();
    if (!method) return false;
    return !method.isDefault || this.savedPaymentMethods().length > 1;
  });

  /**
   * Whether the selected payment method can be set as default
   */
  readonly canSetAsDefault = computed(() => {
    const method = this.selectedPaymentMethod();
    return !!method && !method.isDefault;
  });

  /**
   * Emitted when payment method selection changes
   */
  readonly paymentMethodSelectionChange = output<string>();

  /**
   * Emitted when user wants to toggle the payment method form
   */
  readonly toggleForm = output<void>();

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

  constructor() {
    // Sync payment method selection with input signal
    effect(() => {
      const selectedId = this.selectedPaymentMethodId();
      this.paymentMethodSelectControl.setValue(selectedId, { emitEvent: false });
    });

    // Sync payment type with input signal
    effect(() => {
      const type = this.selectedPaymentType();
      this.paymentTypeSelectControl.setValue(type, { emitEvent: false });
    });

    // Emit change when FormControl value changes
    effect(() => {
      const control = this.paymentMethodSelectControl;
      control.valueChanges.subscribe(value => {
        if (value) {
          this.paymentMethodSelectionChange.emit(value);
        }
      });
    }, { allowSignalWrites: false });

    effect(() => {
      const control = this.paymentTypeSelectControl;
      control.valueChanges.subscribe(value => {
        if (value) {
          this.paymentTypeChange.emit(value);
        }
      });
    }, { allowSignalWrites: false });
  }
}
