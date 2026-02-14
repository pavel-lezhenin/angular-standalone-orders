import { Injectable } from '@angular/core';
import { PaymentFormData } from '@shared/ui/payment-form/payment-form.component';

export interface PaymentRequest {
  method: 'card' | 'paypal' | 'cash_on_delivery';
  amount: number;
  currency?: string;
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
  processingTime?: number; // milliseconds
}

/**
 * Options for payment processing (mainly for testing)
 */
export interface ProcessPaymentOptions {
  /**
   * Skip processing delay (for tests)
   */
  skipDelay?: boolean;
  
  /**
   * Force specific result (for tests)
   */
  forceResult?: 'success' | 'failure';
  
  /**
   * Custom error message (for tests)
   */
  customErrorMessage?: string;
  
  /**
   * Custom transaction ID (for tests)
   */
  customTransactionId?: string;
}

/**
 * Payment Service
 * 
 * Simulates payment processing with realistic bank behavior:
 * - Random processing delay (2-3 seconds)
 * - 90% success rate for card payments
 * - Different behaviors for PayPal and COD
 * - Random error messages on failure
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly SUCCESS_RATE = 0.9; // 90% success rate
  private readonly MIN_DELAY = 2000; // 2 seconds
  private readonly MAX_DELAY = 3500; // 3.5 seconds

  private readonly ERROR_MESSAGES = [
    'Insufficient funds',
    'Card declined by issuing bank',
    'Invalid card number',
    'Card expired',
    'Transaction limit exceeded',
    'Security check failed',
    'Connection timeout with payment gateway',
  ];

  /**
   * Process payment with simulation
   * 
   * @param request - Payment request data
   * @param options - Optional parameters for testing (skipDelay, forceResult, etc.)
   */
  async processPayment(
    request: PaymentRequest, 
    options: ProcessPaymentOptions = {}
  ): Promise<PaymentResult> {
    // Simulate network delay (skip in tests)
    const processingTime = options.skipDelay ? 0 : this.getRandomDelay();
    if (processingTime > 0) {
      await this.delay(processingTime);
    }

    // Different logic based on payment method
    switch (request.method) {
      case 'card':
        return this.processCardPayment(request, processingTime, options);
      
      case 'paypal':
        return this.processPayPalPayment(request, processingTime, options);
      
      case 'cash_on_delivery':
        return this.processCODPayment(request, processingTime, options);
      
      default:
        return {
          success: false,
          errorCode: 'INVALID_METHOD',
          errorMessage: 'Invalid payment method',
          processingTime,
        };
    }
  }

  /**
   * Process card payment (90% success rate)
   */
  private processCardPayment(
    request: PaymentRequest, 
    processingTime: number,
    options: ProcessPaymentOptions
  ): PaymentResult {
    // Allow tests to force specific result
    const isSuccess = options.forceResult 
      ? options.forceResult === 'success'
      : Math.random() < this.SUCCESS_RATE;

    if (isSuccess) {
      return {
        success: true,
        transactionId: options.customTransactionId ?? this.generateTransactionId('CARD'),
        processingTime,
      };
    } else {
      const errorMessage = options.customErrorMessage ?? this.getRandomError();
      return {
        success: false,
        errorCode: 'PAYMENT_DECLINED',
        errorMessage,
        processingTime,
      };
    }
  }

  /**
   * Process PayPal payment (always successful - would redirect in real app)
   */
  private processPayPalPayment(
    request: PaymentRequest, 
    processingTime: number,
    options: ProcessPaymentOptions
  ): PaymentResult {
    // In real app, this would redirect to PayPal
    // For simulation, always succeed (unless forced to fail in tests)
    const isSuccess = options.forceResult !== 'failure';
    
    if (isSuccess) {
      return {
        success: true,
        transactionId: options.customTransactionId ?? this.generateTransactionId('PAYPAL'),
        processingTime,
      };
    } else {
      return {
        success: false,
        errorCode: 'PAYPAL_ERROR',
        errorMessage: options.customErrorMessage ?? 'PayPal payment failed',
        processingTime,
      };
    }
  }

  /**
   * Process Cash on Delivery (always successful - no actual payment)
   */
  private processCODPayment(
    request: PaymentRequest, 
    processingTime: number,
    options: ProcessPaymentOptions
  ): PaymentResult {
    // COD always succeeds (unless forced to fail in tests)
    const isSuccess = options.forceResult !== 'failure';
    
    if (isSuccess) {
      return {
        success: true,
        transactionId: options.customTransactionId ?? this.generateTransactionId('COD'),
        processingTime,
      };
    } else {
      return {
        success: false,
        errorCode: 'COD_ERROR',
        errorMessage: options.customErrorMessage ?? 'Cash on Delivery setup failed',
        processingTime,
      };
    }
  }

  /**
   * Generate transaction ID
   */
  private generateTransactionId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Get random processing delay
   */
  private getRandomDelay(): number {
    return Math.floor(Math.random() * (this.MAX_DELAY - this.MIN_DELAY)) + this.MIN_DELAY;
  }

  /**
   * Get random error message
   */
  private getRandomError(): string {
    const index = Math.floor(Math.random() * this.ERROR_MESSAGES.length);
    return this.ERROR_MESSAGES[index] ?? 'Payment processing failed';
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate payment data before processing
   */
  validatePaymentData(data: PaymentFormData): { valid: boolean; error?: string } {
    if (!data.method) {
      return { valid: false, error: 'Payment method is required' };
    }

    if (data.method === 'card') {
      if (!data.cardNumber || !data.cardholderName || !data.expiryMonth || !data.expiryYear || !data.cvv) {
        return { valid: false, error: 'All card details are required' };
      }

      // Check expiry date is in the future
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const expiryYear = parseInt(data.expiryYear);
      const expiryMonth = parseInt(data.expiryMonth);

      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        return { valid: false, error: 'Card has expired' };
      }
    }

    return { valid: true };
  }
}
