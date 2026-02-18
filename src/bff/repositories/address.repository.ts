import { Injectable } from '@angular/core';
import type { Address } from '../models/address';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class AddressRepository extends BaseRepository<Address> {
  storeName = 'addresses';

  async getByUserId(userId: string): Promise<Address[]> {
    return this.getByIndex('userId', userId);
  }
}
