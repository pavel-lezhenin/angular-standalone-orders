import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { PaymentMethod } from '../models/payment-method';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodRepository extends BaseRepository<PaymentMethod> {
  storeName = 'payment_methods';

  constructor(db: DatabaseService) {
    super(db);
  }

  async getByUserId(userId: string): Promise<PaymentMethod[]> {
    return this.getByIndex('userId', userId);
  }
}
