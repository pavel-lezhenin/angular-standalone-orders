import { ChangeDetectionStrategy, Component, input, output, computed, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormFieldComponent } from '@shared/ui/form-field/form-field.component';
import type { SelectOption } from '@shared/ui/form-field/form-field.component';
import type { PaymentMethodDTO } from '@core/models';

/**
 * Payment Method Selector Component
 *
 * Handles payment method selection, display, and management actions
 */
@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    FormFieldComponent,
  ],
  templateUrl: './payment-method-selector.component.html',
  styleUrl: './payment-method-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodSelectorComponent {
  /**
   * List of saved payment methods
   */
  readonly savedPaymentMethods = input.required<PaymentMethodDTO[]>();

  /**
   * Currently selected payment method ID
   */
  readonly selectedPaymentMethodId = input.required<string>();

  /**
   * Whether the account is in edit mode
   */
  readonly isEditMode = input.required<boolean>();

  /**
   * FormControl for payment method selection
   */
  readonly paymentMethodSelectControl = new FormControl('');

  /**
   * Selected payment method computed from ID
   */
  readonly selectedPaymentMethod = computed(() => {
    const methods = this.savedPaymentMethods();
    return methods.find(method => method.id === this.selectedPaymentMethodId()) ?? null;
  });

  /**
   * Select options computed from saved payment methods
   */
  readonly paymentMethodOptions = computed<SelectOption[]>(() =>
    this.savedPaymentMethods().map(method => ({
      value: method.id,
      label: method.isDefault ? `${method.label} (Default)` : method.label,
    }))
  );

  /**
   * Whether the selected payment method can be deleted
   */
  readonly canDeleteSelected = computed(() => {
    if (!this.isEditMode()) return false;
    const method = this.selectedPaymentMethod();
    if (!method) return false;
    return !method.isDefault || this.savedPaymentMethods().length > 1;
  });

  /**
   * Whether the selected payment method can be set as default
   */
  readonly canSetAsDefault = computed(() => {
    if (!this.isEditMode()) return false;
    const method = this.selectedPaymentMethod();
    return !!method && !method.isDefault;
  });

  /**
   * Event emitted when payment method selection changes
   */
  readonly selectionChange = output<string>();

  /**
   * Event emitted when \"Set as Default\" is clicked
   */
  readonly setAsDefault = output<void>();

  /**
   * Event emitted when \"Delete\" is clicked
   */
  readonly deleteSelected = output<void>();

  constructor() {
    // Synchronize paymentMethodSelectControl with selectedPaymentMethodId signal
    effect(() => {
      const methodId = this.selectedPaymentMethodId();
      if (this.paymentMethodSelectControl.value !== methodId) {
        this.paymentMethodSelectControl.setValue(methodId, { emitEvent: false });
      }
    });

    // Subscribe to paymentMethodSelectControl changes to emit selection change
    this.paymentMethodSelectControl.valueChanges.subscribe((methodId: string | null) => {
      if (methodId && methodId !== this.selectedPaymentMethodId()) {
        this.selectionChange.emit(methodId);
      }
    });
  }
}
