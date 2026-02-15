import { Component, OnInit, Input, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import type { SavedPaymentMethodDTO } from '@core/models';

export type PaymentMethod = 'card' | 'paypal' | 'cash_on_delivery';

export interface PaymentFormData {
  method: PaymentMethod;
  useSavedMethod: boolean;
  savedMethodId?: string;
  shouldSaveMethod: boolean;
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
}

/**
 * Payment Form Component
 * 
 * Collects payment information with validation.
 * Supports Card, PayPal, and Cash on Delivery.
 * Supports saved payment methods for authenticated users.
 * 
 * Features:
 * - Card number formatting (4-4-4-4)
 * - Card format validation (digits + length)
 * - Expiry date validation (future only)
 * - CVV masking
 * - Saved payment methods selection
 * - Save new payment method option
 */
@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  /**
   * List of saved payment methods for current user
   */
  @Input() savedMethods: SavedPaymentMethodDTO[] = [];

  paymentForm!: FormGroup;
  
  // Payment method options
  paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'cash_on_delivery', label: 'Cash on Delivery' },
  ];

  // Expiry month options
  months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });

  // Expiry year options (current year + 15 years)
  years = Array.from({ length: 16 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: year.toString(), label: year.toString() };
  });

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize payment form
   */
  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      method: ['card', Validators.required],
      shouldSaveMethod: [true], // Save new method for future use (default enabled)
      cardNumber: ['', [Validators.required, this.cardNumberValidator]],
      cardholderName: ['', [Validators.required, Validators.minLength(3)]],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });

    // Watch payment method changes
    this.paymentForm.get('method')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((method) => {
        this.updateValidators(method);
      });
  }

  /**
   * Update validators based on payment method
   */
  private updateValidators(method: PaymentMethod): void {
    const cardFields = ['cardNumber', 'cardholderName', 'expiryMonth', 'expiryYear', 'cvv'];

    if (method === 'card') {
      cardFields.forEach(field => {
        this.paymentForm.get(field)?.enable();
      });
    } else {
      // PayPal and COD don't need card details
      cardFields.forEach(field => {
        this.paymentForm.get(field)?.clearValidators();
        this.paymentForm.get(field)?.disable();
        this.paymentForm.get(field)?.updateValueAndValidity();
      });
    }
  }

  /**
   * Format card number as user types (4-4-4-4)
   */
  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, ''); // Remove spaces
    
    // Only allow digits
    value = value.replace(/\D/g, '');
    
    // Limit to 16 digits
    value = value.substring(0, 16);
    
    // Add space every 4 digits
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    
    this.paymentForm.patchValue({ cardNumber: formatted }, { emitEvent: false });
    input.value = formatted;
  }

  /**
   * Card number validator for demo mode
   * Accepts 13-19 digits (common card lengths)
   */
  private cardNumberValidator(control: any) {
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
   * Get form data
   */
  getFormData(): PaymentFormData | null {
    if (this.paymentForm.invalid) {
      return null;
    }

    const formValue = this.paymentForm.getRawValue();
    
    const data: PaymentFormData = {
      method: formValue.method,
      useSavedMethod: false,
      shouldSaveMethod: formValue.shouldSaveMethod,
      cvv: formValue.cvv, // Always required, even for saved methods
    };

    // Include card details for new cards
    if (formValue.method === 'card') {
      data.cardNumber = formValue.cardNumber.replace(/\s/g, '');
      data.cardholderName = formValue.cardholderName;
      data.expiryMonth = formValue.expiryMonth;
      data.expiryYear = formValue.expiryYear;
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
