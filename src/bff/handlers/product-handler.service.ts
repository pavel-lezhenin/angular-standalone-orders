import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { ProductRepository } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { OrderRepository } from '../repositories/order.repository';
import { FileStorageService } from '../../core/services/file-storage.service';
import { Product, ProductWithCategoryResponse, ProductSpecification } from '../models';
import {
  OkResponse,
  CreatedResponse,
  NotFoundResponse,
  BadRequestResponse,
  ServerErrorResponse,
  ConflictResponse,
} from './http-responses';
import {
  parsePaginationParams,
  applyPagination,
  createPaginatedResponse,
} from '../../core/types/pagination';
import { randomDelay } from '../utils';
import { DEFAULT_PRODUCT_IMAGE } from '../../shared/constants/product.constants';

/**
 * Create/Update product request body
 */
interface ProductRequestBody {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  imageIds: string[]; // Array of file IDs
  specifications: ProductSpecification[];
}

/**
 * Product Handler Service
 * Handles product-related API requests
 * Returns ProductWithCategoryResponse (with categoryName) - BFF does the JOIN
 * Resolves imageIds to imageUrls using FileStorageService
 */
@Injectable({
  providedIn: 'root',
})
export class ProductHandlerService {
  private readonly fileStorage = inject(FileStorageService);

  constructor(
    private productRepo: ProductRepository,
    private categoryRepo: CategoryRepository,
    private orderRepo: OrderRepository
  ) {}

  /**
   * Handle get all products request with pagination, search, and category filter
   * Returns ProductWithCategoryResponse[] with categoryName populated and imageUrls resolved
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

      // Enrich products with category names and resolve image URLs
      const productsWithCategoryPromises = products.map(async (product) => {
        const imageUrls = await this.resolveImageUrls(product.imageIds);

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          stock: product.stock,
          imageUrls,
          specifications: product.specifications,
          categoryName: categoriesMap.get(product.categoryId),
          imageUrl: imageUrls[0] || product.imageUrl, // Legacy support
        } as ProductWithCategoryResponse;
      });

      const productsWithCategory = await Promise.all(productsWithCategoryPromises);

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
   * Returns product with resolved image URLs
   */
  async handleGetProduct(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const id = req.url.split('/').pop()!;
      const product = await this.productRepo.getById(id);

      if (!product) {
        return new NotFoundResponse('Product not found');
      }

      // Resolve image URLs
      const imageUrls = await this.resolveImageUrls(product.imageIds);

      const productResponse = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        stock: product.stock,
        imageUrls,
        specifications: product.specifications,
        imageUrl: imageUrls[0] || product.imageUrl, // Legacy support
      };

      return new OkResponse({ product: productResponse });
    } catch (err) {
      return new ServerErrorResponse('Failed to fetch product');
    }
  }

  /**
   * Handle batch get products by IDs request
   * POST /api/products/batch
   * Body: { productIds: string[] }
   * Returns: { products: ProductResponse[] }
   */
  async handleGetProductsByIds(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const body = req.body as { productIds: string[] };
      
      if (!body?.productIds || !Array.isArray(body.productIds)) {
        return new BadRequestResponse('productIds array is required');
      }

      // Fetch all products in parallel
      const productPromises = body.productIds.map(id => this.productRepo.getById(id));
      const products = await Promise.all(productPromises);

      // Filter out null results and resolve image URLs
      const productsWithImagesPromises = products
        .filter((p): p is Product => p !== null)
        .map(async (product) => {
          const imageUrls = await this.resolveImageUrls(product.imageIds);
          
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId,
            stock: product.stock,
            imageUrls,
            specifications: product.specifications,
            imageUrl: imageUrls[0] || product.imageUrl, // Legacy support
          };
        });

      const productsWithImages = await Promise.all(productsWithImagesPromises);

      return new OkResponse({ products: productsWithImages });
    } catch (err) {
      console.error('Batch get products error:', err);
      return new ServerErrorResponse('Failed to fetch products');
    }
  }

  /**
   * Handle create product request
   */
  async handleCreateProduct(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const body = req.body as ProductRequestBody;

      // Validate required fields
      if (!body.name || !body.categoryId || body.price === undefined || body.stock === undefined) {
        return new BadRequestResponse('Missing required fields');
      }

      // Validate category exists
      const category = await this.categoryRepo.getById(body.categoryId);
      if (!category) {
        return new BadRequestResponse('Invalid category');
      }

      // Create product entity
      const now = Date.now();
      const product: Product = {
        id: uuidv4(),
        name: body.name,
        description: body.description || '',
        price: body.price,
        categoryId: body.categoryId,
        stock: body.stock,
        imageIds: body.imageIds || [],
        specifications: body.specifications || [],
        imageUrl: '', // Legacy field
        createdAt: now,
        updatedAt: now,
      };

      await this.productRepo.create(product);

      // Resolve image URLs for response
      const imageUrls = await this.resolveImageUrls(product.imageIds);

      return new CreatedResponse({
        product: {
          ...product,
          imageUrls,
          imageUrl: imageUrls[0] || '',
        },
      });
    } catch (err) {
      console.error('Create product error:', err);
      return new ServerErrorResponse('Failed to create product');
    }
  }

  /**
   * Handle update product request
   */
  async handleUpdateProduct(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const id = req.url.split('/').pop()!;
      const body = req.body as ProductRequestBody;

      // Check if product exists
      const existingProduct = await this.productRepo.getById(id);
      if (!existingProduct) {
        return new NotFoundResponse('Product not found');
      }

      // Validate category if changed
      if (body.categoryId) {
        const category = await this.categoryRepo.getById(body.categoryId);
        if (!category) {
          return new BadRequestResponse('Invalid category');
        }
      }

      // Update product
      const updatedProduct: Product = {
        ...existingProduct,
        name: body.name || existingProduct.name,
        description: body.description !== undefined ? body.description : existingProduct.description,
        price: body.price !== undefined ? body.price : existingProduct.price,
        categoryId: body.categoryId || existingProduct.categoryId,
        stock: body.stock !== undefined ? body.stock : existingProduct.stock,
        imageIds: body.imageIds || existingProduct.imageIds,
        specifications: body.specifications || existingProduct.specifications,
        updatedAt: Date.now(),
      };

      await this.productRepo.updateFull(updatedProduct);

      // Resolve image URLs for response
      const imageUrls = await this.resolveImageUrls(updatedProduct.imageIds);

      return new OkResponse({
        product: {
          ...updatedProduct,
          imageUrls,
          imageUrl: imageUrls[0] || '',
        },
      });
    } catch (err) {
      console.error('Update product error:', err);
      return new ServerErrorResponse('Failed to update product');
    }
  }

  /**
   * Handle delete product request
   * Checks if product has associated orders before deletion
   */
  async handleDeleteProduct(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const id = req.url.split('/').pop()!;

      // Check if product exists
      const product = await this.productRepo.getById(id);
      if (!product) {
        return new NotFoundResponse('Product not found');
      }

      // Check if product has associated orders
      const orders = await this.orderRepo.getAll();
      const hasOrders = orders.some((order) =>
        order.items.some((item) => item.productId === id)
      );

      if (hasOrders) {
        return new ConflictResponse(
          'Cannot delete product: It has associated orders'
        );
      }

      // Delete product
      await this.productRepo.delete(id);

      // Delete associated images from file storage
      if (product.imageIds && product.imageIds.length > 0) {
        await this.fileStorage.deleteFiles(product.imageIds);
      }

      return new OkResponse({ message: 'Product deleted successfully' });
    } catch (err) {
      console.error('Delete product error:', err);
      return new ServerErrorResponse('Failed to delete product');
    }
  }

  /**
   * Resolve image IDs to URLs
   * Returns default product image if no images provided
   */
  private async resolveImageUrls(imageIds: string[]): Promise<string[]> {
    if (!imageIds || imageIds.length === 0) {
      return [DEFAULT_PRODUCT_IMAGE];
    }

    const urlMap = await this.fileStorage.getFileUrls(imageIds);
    const resolvedUrls = imageIds
      .map((id) => urlMap.get(id))
      .filter((url): url is string => url !== undefined);

    // Return default image if no URLs were resolved
    return resolvedUrls.length > 0 ? resolvedUrls : [DEFAULT_PRODUCT_IMAGE];
  }
}
