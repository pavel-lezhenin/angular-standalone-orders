import { Injectable, signal } from '@angular/core';
import type { CreateOrderDTO } from '@core/models';

export interface PendingPaymentData {
  orderData: CreateOrderDTO;
  total: number;
  itemCount: number;
}

/**
 * Payment State Service
 *
 * Stores pending payment data when navigating from checkout to payment page.
 * This avoids passing sensitive order data through URL params.
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentStateService {
  private pendingPayment = signal<PendingPaymentData | null>(null);

  /**
   * Set pending payment data
   */
  setPendingPayment(data: PendingPaymentData): void {
    this.pendingPayment.set(data);
  }

  /**
   * Get pending payment data
   */
  getPendingPayment(): PendingPaymentData | null {
    return this.pendingPayment();
  }

  /**
   * Clear pending payment data
   */
  clearPendingPayment(): void {
    this.pendingPayment.set(null);
  }

  /**
   * Check if there is pending payment
   */
  hasPendingPayment(): boolean {
    return this.pendingPayment() !== null;
  }
}
