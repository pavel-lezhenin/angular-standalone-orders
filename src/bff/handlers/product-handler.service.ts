import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { ProductRepository } from '../repositories/product.repository';
import { OkResponse, NotFoundResponse, ServerErrorResponse } from './http-responses';

/**
 * Product Handler Service
 * Handles product-related API requests
 */
@Injectable({
  providedIn: 'root',
})
export class ProductHandlerService {
  constructor(private productRepo: ProductRepository) {}

  /**
   * Handle get all products request
   */
  async handleGetProducts(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const products = await this.productRepo.getAll();
      return new OkResponse({ products });
    } catch (err) {
      return new ServerErrorResponse('Failed to fetch products');
    }
  }

  /**
   * Handle get product by ID request
   */
  async handleGetProduct(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const id = req.url.split('/').pop()!;
      const product = await this.productRepo.getById(id);

      if (!product) {
        return new NotFoundResponse('Product not found');
      }

      return new OkResponse({ product });
    } catch (err) {
      return new ServerErrorResponse('Failed to fetch product');
    }
  }
}
