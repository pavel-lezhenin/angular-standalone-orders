import { Injectable } from '@angular/core';
import type { Order } from '../models';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class OrderRepository extends BaseRepository<Order> {
  storeName = 'orders';

  async getByUserId(userId: string): Promise<Order[]> {
    return this.getByIndex('userId', userId);
  }

  async getByStatus(status: string): Promise<Order[]> {
    return this.getByIndex('status', status);
  }
}
