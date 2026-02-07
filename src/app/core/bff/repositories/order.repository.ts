import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Order } from '../models';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class OrderRepository extends BaseRepository<Order> {
  storeName = 'orders';

  constructor(db: DatabaseService) {
    super(db);
  }

  async getByUserId(userId: string): Promise<Order[]> {
    return this.getByIndex('userId', userId);
  }

  async getByStatus(status: string): Promise<Order[]> {
    return this.getByIndex('status', status);
  }
}
