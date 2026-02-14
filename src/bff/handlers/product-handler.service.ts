import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { ProductRepository } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { ProductWithCategoryResponse } from '../models';
import { OkResponse, NotFoundResponse, ServerErrorResponse } from './http-responses';
import { 
  parsePaginationParams, 
  applyPagination, 
  createPaginatedResponse 
} from '../../core/types/pagination';
import { randomDelay } from '../utils';

/**
 * Product Handler Service
 * Handles product-related API requests
 * Returns ProductWithCategoryResponse (with categoryName) - BFF does the JOIN
 */
@Injectable({
  providedIn: 'root',
})
export class ProductHandlerService {
  constructor(
    private productRepo: ProductRepository,
    private categoryRepo: CategoryRepository
  ) {}

  /**
   * Handle get all products request with pagination, search, and category filter
   * Returns ProductWithCategoryResponse[] with categoryName populated
   */
  async handleGetProducts(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const { page, limit } = parsePaginationParams(req.params);
      const search = req.params.get('search') || undefined;
      const categoryId = req.params.get('categoryId') || undefined;

      // Get filtered products
      let products = await this.productRepo.filter({ categoryId, search });

      // Load all categories for JOIN
      const categories = await this.categoryRepo.getAll();
      const categoriesMap = new Map(categories.map((cat) => [cat.id, cat.name]));

      // Enrich products with category names (BFF does the JOIN)
      const productsWithCategory: ProductWithCategoryResponse[] = products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryName: categoriesMap.get(product.categoryId),
      }));

      // Apply pagination
      const total = productsWithCategory.length;
      const paginatedProducts = applyPagination(productsWithCategory, page, limit);

      return new OkResponse(
        createPaginatedResponse(paginatedProducts, total, page, limit)
      );
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
