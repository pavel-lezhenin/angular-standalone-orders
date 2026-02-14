import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Address } from '../models/address';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class AddressRepository extends BaseRepository<Address> {
  storeName = 'addresses';

  constructor(db: DatabaseService) {
    super(db);
  }

  async getByUserId(userId: string): Promise<Address[]> {
    return this.getByIndex('userId', userId);
  }
}
