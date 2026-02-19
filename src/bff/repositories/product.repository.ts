import { Injectable } from '@angular/core';
import type { Product } from '../models';
import { BaseRepository } from './base.repository';

@Injectable({
  providedIn: 'root',
})
export class ProductRepository extends BaseRepository<Product> {
  storeName = 'products';

  async getByCategoryId(categoryId: string): Promise<Product[]> {
    return this.getByIndex('categoryId', categoryId);
  }

  /**
   * Search products by name or ID
   */
  async search(query: string): Promise<Product[]> {
    const allProducts = await this.getAll();
    const searchLower = query.toLowerCase();

    return allProducts.filter(
      (product) =>
        product.id.toLowerCase().includes(searchLower) ||
        product.name.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Filter products with multiple criteria
   */
  async filter(options: { categoryId?: string; search?: string }): Promise<Product[]> {
    let products = await this.getAll();

    // Filter by category
    if (options.categoryId) {
      products = products.filter((p) => p.categoryId === options.categoryId);
    }

    // Filter by search query
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.id.toLowerCase().includes(searchLower) || p.name.toLowerCase().includes(searchLower)
      );
    }

    return products;
  }
}
