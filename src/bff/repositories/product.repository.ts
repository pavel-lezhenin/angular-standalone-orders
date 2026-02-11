import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Product } from '../models';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class ProductRepository extends BaseRepository<Product> {
  storeName = 'products';

  constructor(db: DatabaseService) {
    super(db);
  }

  async getByCategoryId(categoryId: string): Promise<Product[]> {
    return this.getByIndex('categoryId', categoryId);
  }
}
