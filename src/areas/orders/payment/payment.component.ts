import { ChangeDetectionStrategy, Component, OnInit, ViewChild, signal, computed, inject, PLATFORM_ID, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { OrdersPaymentFormComponent, PaymentFormData } from '../ui/payment-form/orders-payment-form.component';
import { PageLoaderComponent } from '@shared/ui/page-loader/page-loader.component';
import { OrderSummaryComponent } from '@shared/ui';
import { FormFieldComponent, type SelectOption } from '@shared/ui/form-field/form-field.component';
import { PaymentService, PaymentRequest, PaymentResult } from '@areas/orders/services/payment.service';
import { PaymentStateService } from '@areas/orders/services/payment-state.service';
import { UserPreferencesService } from '@shared/services/user-preferences.service';
import { OrderService } from '@areas/orders/services/order.service';
import { CartService } from '@shared/services/cart.service';
import { NotificationService } from '@shared/services/notification.service';
import type { CreateOrderDTO, SavedPaymentMethodDTO } from '@core/models';

type PaymentState = 'form' | 'processing' | 'success' | 'failure';

/**
 * Payment Page Component
 * 
 * Handles payment processing for orders:
 * 1. Shows order summary
 * 2. Collects payment information
 * 3. Processes payment (simulated)
 * 4. On success: creates order, clears cart, navigates to confirmation
 * 5. On failure: shows error, allows retry
 */
@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCardModule,
    OrdersPaymentFormComponent,
    PageLoaderComponent,
    OrderSummaryComponent,
    FormFieldComponent,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaymentComponent implements OnInit {
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private paymentStateService = inject(PaymentStateService);
  private userPreferencesService = inject(UserPreferencesService);
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private notification = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild(OrdersPaymentFormComponent) paymentForm!: OrdersPaymentFormComponent;

  protected state = signal<PaymentState>('form');
  protected orderData = signal<CreateOrderDTO | null>(null);
  protected total = signal<number>(0);
  protected itemCount = signal<number>(0);
  protected savedPaymentMethods = signal<SavedPaymentMethodDTO[]>([]);
  protected selectedSavedMethodId = signal<string>('');  
  protected savedMethodSelectControl = new FormControl('');
  protected showNewPaymentForm = signal(false);
  protected savedMethodCvv = new FormControl('', [Validators.required, Validators.pattern(/^\d{3,4}$/)]);
  protected errorMessage = signal<string>('');
  protected transactionId = signal<string>('');
  protected processingTime = signal<number>(0);

  protected isProcessing = computed(() => this.state() === 'processing');
  protected isSuccess = computed(() => this.state() === 'success');
  protected isFailure = computed(() => this.state() === 'failure');
  protected hasSavedPaymentMethods = computed(() => this.savedPaymentMethods().length > 0);
  protected usingSavedPaymentMethod = computed(() => this.hasSavedPaymentMethods() && !this.showNewPaymentForm());
  protected canDeleteSelectedSavedMethod = computed(() => {
    const selectedMethod = this.getSelectedSavedMethod();
    if (!selectedMethod) {
      return false;
    }

    if (!selectedMethod.isDefault) {
      return true;
    }

    return this.savedPaymentMethods().length > 1;
  });
  protected selectedSavedMethodType = computed(() => this.getSelectedSavedMethod()?.type ?? null);
  protected paymentMethodSelectOptions = computed<SelectOption[]>(() =>
    this.savedPaymentMethods().map(method => ({
      value: method.id,
      label: method.type === 'card'
        ? `Card ending in ${method.last4Digits}${method.isDefault ? ' (Default)' : ''}`
        : `PayPal${method.paypalEmail ? ' (' + method.paypalEmail + ')' : ''}${method.isDefault ? ' (Default)' : ''}`,
    }))
  );

  constructor() {
    // Synchronize savedMethodSelectControl with selectedSavedMethodId signal
    effect(() => {
      const methodId = this.selectedSavedMethodId();
      if (this.savedMethodSelectControl.value !== methodId) {
        this.savedMethodSelectControl.setValue(methodId, { emitEvent: false });
      }
    });

    // Subscribe to savedMethodSelectControl changes to trigger onSavedMethodChange
    this.savedMethodSelectControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(methodId => {
        if (methodId && methodId !== this.selectedSavedMethodId()) {
          this.onSavedMethodChange(methodId);
        }
      });
  }

  ngOnInit(): void {
    // Skip on server
    if (!this.isBrowser) {
      return;
    }

    // Get pending payment data
    const pendingPayment = this.paymentStateService.getPendingPayment();

    if (!pendingPayment) {
      this.notification.error('No pending payment found');
      this.router.navigate(['/orders/cart']);
      return;
    }

    this.orderData.set(pendingPayment.orderData);
    this.total.set(pendingPayment.total);
    this.itemCount.set(pendingPayment.itemCount);

    // Load saved payment methods
    this.loadSavedPaymentMethods();
  }

  /**
   * Load user's saved payment methods
   */
  private async loadSavedPaymentMethods(): Promise<void> {
    try {
      const methods = await this.userPreferencesService.getSavedPaymentMethods();
      this.savedPaymentMethods.set(methods);

      const defaultMethod = methods.find(method => method.isDefault) ?? methods[0];
      this.selectedSavedMethodId.set(defaultMethod?.id ?? '');
      this.showNewPaymentForm.set(methods.length === 0);
      this.updateSavedMethodCvvValidators();
    } catch (error) {
      console.error('Failed to load saved payment methods:', error);
      // Don't fail the page if we can't load saved methods
      this.savedPaymentMethods.set([]);
      this.selectedSavedMethodId.set('');
      this.showNewPaymentForm.set(true);
      this.updateSavedMethodCvvValidators();
    }
  }

  protected onSavedMethodChange(methodId: string): void {
    this.selectedSavedMethodId.set(methodId);
    this.updateSavedMethodCvvValidators();
  }

  protected toggleNewPaymentForm(): void {
    const nextValue = !this.showNewPaymentForm();
    this.showNewPaymentForm.set(nextValue);

    if (!nextValue) {
      this.savedMethodCvv.reset('');
    }

    this.updateSavedMethodCvvValidators();
  }

  private updateSavedMethodCvvValidators(): void {
    const selectedMethod = this.getSelectedSavedMethod();

    if (selectedMethod?.type === 'card' && this.usingSavedPaymentMethod()) {
      this.savedMethodCvv.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    } else {
      this.savedMethodCvv.clearValidators();
      this.savedMethodCvv.setValue('');
    }

    this.savedMethodCvv.updateValueAndValidity({ emitEvent: false });
  }

  protected async deleteSelectedSavedMethod(): Promise<void> {
    if (!this.canDeleteSelectedSavedMethod()) {
      this.notification.error('Cannot delete the only default payment method');
      return;
    }

    const selectedMethodId = this.selectedSavedMethodId();
    if (!selectedMethodId) {
      this.notification.error('Please select a payment method to delete');
      return;
    }

    try {
      await this.userPreferencesService.deletePaymentMethod(selectedMethodId);
      this.notification.success('Payment method deleted');
      await this.loadSavedPaymentMethods();
      this.savedMethodCvv.reset('');
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to delete payment method';
      this.notification.error(errorMessage);
    }
  }

  private getSelectedSavedMethod(): SavedPaymentMethodDTO | null {
    const selectedMethod = this.savedPaymentMethods().find(
      method => method.id === this.selectedSavedMethodId()
    );

    return selectedMethod ?? null;
  }

  /**
   * Process payment
   */
  protected async processPayment(): Promise<void> {
    let formData: PaymentFormData | null = null;

    if (this.usingSavedPaymentMethod()) {
      const selectedMethod = this.getSelectedSavedMethod();
      if (!selectedMethod) {
        this.notification.error('Please select a saved payment method');
        return;
      }

      if (selectedMethod.type === 'card' && this.savedMethodCvv.invalid) {
        this.savedMethodCvv.markAsTouched();
        this.notification.error('Please enter CVV');
        return;
      }

      formData = {
        method: selectedMethod.type,
        useSavedMethod: true,
        savedMethodId: selectedMethod.id,
        shouldSaveMethod: false,
        cvv: selectedMethod.type === 'card' ? (this.savedMethodCvv.value ?? '') : undefined,
      };

      if (selectedMethod.type === 'card') {
        formData.cardNumber = `411111111111${selectedMethod.last4Digits ?? '1111'}`;
        formData.cardholderName = selectedMethod.cardholderName || 'Saved Card';
        formData.expiryMonth = selectedMethod.expiryMonth || '12';
        formData.expiryYear = selectedMethod.expiryYear || `${new Date().getFullYear() + 1}`;
      }
    } else {
      if (!this.paymentForm?.isValid()) {
        this.paymentForm?.markAllAsTouched();
        this.notification.error('Please fill in all required fields');
        return;
      }

      formData = this.paymentForm.getFormData();
      if (!formData) {
        this.notification.error('Invalid payment data');
        return;
      }
    }

    // Validate payment data
    const validation = this.paymentService.validatePaymentData(formData!);
    if (!validation.valid) {
      this.notification.error(validation.error || 'Invalid payment data');
      return;
    }

    // Build payment request
    const paymentRequest: PaymentRequest = {
      method: formData!.method,
      amount: this.total(),
      currency: 'USD',
      cardNumber: formData!.cardNumber,
      cardholderName: formData!.cardholderName,
      expiryMonth: formData!.expiryMonth,
      expiryYear: formData!.expiryYear,
      cvv: formData!.cvv,
    };

    // Start processing
    this.state.set('processing');

    try {
      // Process payment
      const result = await this.paymentService.processPayment(paymentRequest);
      this.processingTime.set(result.processingTime || 0);

      if (result.success) {
        // Payment successful
        this.transactionId.set(result.transactionId || '');
        this.state.set('success');

        // Save payment method if requested
        if (!this.usingSavedPaymentMethod() && formData!.shouldSaveMethod && !formData!.useSavedMethod) {
          try {
            await this.savePaymentMethod(formData!);
          } catch {
            // Payment is already successful; continue order creation
          }
        }

        // Create order
        await this.createOrder(result.transactionId || '', formData!.method);

      } else {
        // Payment failed
        this.errorMessage.set(result.errorMessage || 'Payment declined');
        this.state.set('failure');
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      this.errorMessage.set('An unexpected error occurred. Please try again.');
      this.state.set('failure');
    }
  }

  /**
   * Create order after successful payment
   */
  private async createOrder(transactionId: string, paymentMethod: PaymentFormData['method']): Promise<void> {
    const orderData = this.orderData();
    if (!orderData) {
      this.notification.error('Order data not found');
      this.router.navigate(['/orders/cart']);
      return;
    }

    try {
      // Create order with payment info
      const orderToCreate = {
        ...orderData,
        status: 'paid' as const,
        paymentStatus: 'approved' as const,
        transactionId,
      };

      const createdOrder = await this.orderService.createOrder(orderToCreate);

      // Clear cart
      this.cartService.clear();

      // Clear pending payment
      this.paymentStateService.clearPendingPayment();

      // Navigate to confirmation
      setTimeout(() => {
        this.router.navigate(['/orders/confirmation', createdOrder.id]);
      }, 1500); // Small delay to show success state

    } catch (error) {
      console.error('Order creation error:', error);
      this.notification.error('Failed to create order. Please contact support.');
    }
  }

  /**
   * Save payment method for future use
   */
  private async savePaymentMethod(formData: PaymentFormData): Promise<void> {
    try {
      if (formData.method === 'card' && formData.cardNumber) {
        // Extract last 4 digits from card number
        const last4Digits = formData.cardNumber.slice(-4);

        await this.userPreferencesService.addPaymentMethod({
          type: 'card',
          last4Digits,
          cardholderName: formData.cardholderName,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          setAsDefault: this.savedPaymentMethods().length === 0, // First method is default
        });

        this.notification.success('Payment method saved for future use');
      } else if (formData.method === 'paypal') {
        // In real app, would save PayPal email from OAuth flow
        // For demo, just show that it would be saved
        this.notification.success('PayPal account saved for future use');
      }
    } catch (error) {
      console.error('Failed to save payment method:', error);
      this.notification.error('Payment completed, but saving payment method failed');
      throw error;
    }
  }

  /**
   * Retry payment
   */
  protected retryPayment(): void {
    this.state.set('form');
    this.errorMessage.set('');
  }

  /**
   * Cancel and go back to cart
   */
  protected cancelPayment(): void {
    this.paymentStateService.clearPendingPayment();
    this.router.navigate(['/orders/cart']);
  }
}
