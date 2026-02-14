import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PermissionService } from '@core/services/permission.service';
import { PaginationParams, PaginatedResponse } from '@core/types';
import { ProductDTO, CategoryDTO } from '@core';
import { CreateProductDTO, UpdateProductDTO } from '../model/types';

export interface ProductPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ProductFilters extends PaginationParams {
  categoryId?: string;
}

/**
 * Product service (admin area)
 *
 * Pure HTTP service for product CRUD operations
 * Uses HTTP requests that are intercepted by FakeBFFService
 *
 * State management is component's responsibility
 */
@Injectable()
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly permission = inject(PermissionService);
  private readonly apiUrl = '/api/products';

  /**
   * Get permissions for current user (synchronous)
   */
  getPermissions(): ProductPermissions {
    return {
      canCreate: this.permission.hasAccess('products', 'create'),
      canEdit: this.permission.hasAccess('products', 'edit'),
      canDelete: this.permission.hasAccess('products', 'delete'),
    };
  }

  /**
   * Load products with pagination and filters
   */
  async loadProducts(
    params: ProductFilters = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<ProductDTO>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.categoryId) {
      httpParams = httpParams.set('categoryId', params.categoryId);
    }

    return firstValueFrom(
      this.http.get<PaginatedResponse<ProductDTO>>(this.apiUrl, { params: httpParams })
    );
  }

  /**
   * Get single product by ID
   */
  async getProduct(productId: string): Promise<ProductDTO> {
    const response = await firstValueFrom(
      this.http.get<{ product: ProductDTO }>(`${this.apiUrl}/${productId}`)
    );
    return response.product;
  }

  /**
   * Create new product
   */
  async createProduct(product: CreateProductDTO): Promise<ProductDTO> {
    const response = await firstValueFrom(
      this.http.post<{ product: ProductDTO }>(this.apiUrl, product)
    );
    return response.product;
  }

  /**
   * Update existing product
   */
  async updateProduct(
    productId: string,
    product: UpdateProductDTO
  ): Promise<ProductDTO> {
    const response = await firstValueFrom(
      this.http.put<{ product: ProductDTO }>(`${this.apiUrl}/${productId}`, product)
    );
    return response.product;
  }

  /**
   * Delete product by ID
   * Returns error message if product has associated orders
   */
  async deleteProduct(productId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${productId}`));
  }
}
