import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PaymentFormComponent } from '@shared/ui/payment-form/payment-form.component';

export type PaymentMethod = 'card' | 'paypal' | 'cash_on_delivery';

export interface PaymentFormData {
  method: PaymentMethod;
  shouldSaveMethod: boolean;
  
  // Optional: for saved payment methods
  useSavedMethod?: boolean;
  savedMethodId?: string;
  
  // Card fields
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
}

/**
 * Orders Payment Form Component (Smart)
 * 
 * Checkout-specific payment form with full orchestration.
 * 
 * Features:
 * - Payment method selection (Card, PayPal, COD)
 * - Card validation with Luhn check
 * - CVV validation
 * - "Save method for future" option
 * - Form data extraction for order processing
 * 
 * This is a SMART component:
 * - Creates own FormGroup
 * - Handles validation logic
 * - Manages payment method switching
 * - Domain-specific (checkout flow)
 */
@Component({
  selector: 'app-orders-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatIconModule,
    MatCheckboxModule,
    PaymentFormComponent,
  ],
  templateUrl: './orders-payment-form.component.html',
  styleUrl: './orders-payment-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPaymentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  protected paymentForm!: FormGroup;

  // Payment method options
  protected readonly paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'cash_on_delivery', label: 'Cash on Delivery' },
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize payment form with nested cardFields group
   */
  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      method: ['card', Validators.required],
      shouldSaveMethod: [true],

      // Nested card fields group (passed to PaymentFormComponent)
      cardFields: this.fb.group({
        cardNumber: ['', [Validators.required, this.cardNumberValidator.bind(this)]],
        cardholderName: ['', [Validators.required, Validators.minLength(3)]],
        expiryMonth: ['', Validators.required],
        expiryYear: ['', Validators.required],
        cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      }),
    });

    // Watch payment method changes
    this.paymentForm.get('method')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((method) => {
        this.updateCardFieldsValidators(method);
      });
  }

  /**
   * Update card fields validators based on payment method
   */
  private updateCardFieldsValidators(method: PaymentMethod): void {
    const cardFields = this.paymentForm.get('cardFields') as FormGroup;
    if (!cardFields) return;

    if (method === 'card') {
      // Enable all card fields
      Object.keys(cardFields.controls).forEach((fieldName) => {
        const control = cardFields.get(fieldName);
        if (!control) return;

        // Restore validators
        if (fieldName === 'cardNumber') {
          control.setValidators([Validators.required, this.cardNumberValidator.bind(this)]);
        } else if (fieldName === 'cardholderName') {
          control.setValidators([Validators.required, Validators.minLength(3)]);
        } else if (fieldName === 'cvv') {
          control.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
        } else {
          control.setValidators([Validators.required]);
        }

        control.enable({ emitEvent: false });
        control.updateValueAndValidity({ emitEvent: false });
      });
    } else {
      // PayPal and COD don't need card details
      Object.keys(cardFields.controls).forEach((fieldName) => {
        const control = cardFields.get(fieldName);
        if (!control) return;

        control.clearValidators();
        control.setErrors(null);
        control.disable({ emitEvent: false });
        control.updateValueAndValidity({ emitEvent: false });
      });
    }

    this.paymentForm.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Card number validator for demo mode
   * Accepts 13-19 digits (common card lengths)
   */
  private cardNumberValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const cardNumber = control.value.replace(/\s/g, '');

    if (!/^\d+$/.test(cardNumber)) {
      return { invalidCard: 'Card number must contain only digits' };
    }

    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return { invalidCard: 'Card number must be 13-19 digits' };
    }

    // Prevent obviously invalid repeated digits like 0000... or 1111...
    if (/^(\d)\1+$/.test(cardNumber)) {
      return { invalidCard: 'Invalid card number' };
    }

    return null;
  }

  /**
   * Get form data for order processing
   */
  getFormData(): PaymentFormData | null {
    if (this.paymentForm.invalid) {
      return null;
    }

    const formValue = this.paymentForm.getRawValue();
    const method = formValue.method as PaymentMethod;

    const data: PaymentFormData = {
      method,
      shouldSaveMethod: formValue.shouldSaveMethod,
    };

    // Include card details for card payment
    if (method === 'card' && formValue.cardFields) {
      data.cardNumber = formValue.cardFields.cardNumber?.replace(/\s/g, '');
      data.cardholderName = formValue.cardFields.cardholderName;
      data.expiryMonth = formValue.cardFields.expiryMonth;
      data.expiryYear = formValue.cardFields.expiryYear;
      data.cvv = formValue.cardFields.cvv;
    }

    return data;
  }

  /**
   * Check if form is valid
   */
  isValid(): boolean {
    return this.paymentForm.valid;
  }

  /**
   * Mark all fields as touched (for validation display)
   */
  markAllAsTouched(): void {
    this.paymentForm.markAllAsTouched();
  }
}
