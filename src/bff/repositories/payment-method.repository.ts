import { Injectable } from '@angular/core';
import type { PaymentMethod } from '../models/payment-method';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodRepository extends BaseRepository<PaymentMethod> {
  storeName = 'payment_methods';

  async getByUserId(userId: string): Promise<PaymentMethod[]> {
    return this.getByIndex('userId', userId);
  }
}
