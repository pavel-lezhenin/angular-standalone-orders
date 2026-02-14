import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { CategoryRepository } from '../repositories/category.repository';
import { ProductRepository } from '../repositories/product.repository';
import { randomDelay } from '../utils';
import type { Category } from '../models';
import { OkResponse, CreatedResponse, NoContentResponse, BadRequestResponse, NotFoundResponse, ServerErrorResponse } from './http-responses';
import { parsePaginationParams, applyPagination, createPaginatedResponse } from '../../core/types/pagination';

/**
 * Category Handler Service
 * Handles category-related API requests
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryHandlerService {
  constructor(
    private categoryRepo: CategoryRepository,
    private productRepo: ProductRepository,
  ) {}

  /**
   * Handle get all categories request with pagination and search
   */
  async handleGetCategories(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const { page, limit, search } = parsePaginationParams(req.params);

      let categories = await this.categoryRepo.getAll();

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        categories = categories.filter(category => 
          category.name.toLowerCase().includes(searchLower) ||
          category.description.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const total = categories.length;
      const paginatedCategories = applyPagination(categories, page, limit);

      return new OkResponse(
        createPaginatedResponse(paginatedCategories, total, page, limit)
      );
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      return new ServerErrorResponse('Failed to fetch categories');
    }
  }

  /**
   * Handle create category request
   */
  async handleCreateCategory(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const body = req.body as Partial<Category>;
      
      // Validate required fields
      if (!body.name || !body.description) {
        return new BadRequestResponse('Name and description are required');
      }

      // Validate max lengths
      if (body.name.length > 32) {
        return new BadRequestResponse('Name must not exceed 32 characters');
      }

      if (body.description.length > 128) {
        return new BadRequestResponse('Description must not exceed 128 characters');
      }
      
      const categoryData: Category = {
        id: crypto.randomUUID(),
        name: body.name.trim(),
        description: body.description.trim(),
      };

      await this.categoryRepo.create(categoryData);
      
      return new CreatedResponse(categoryData);
    } catch (err) {
      console.error('Failed to create category:', err);
      return new ServerErrorResponse('Failed to create category');
    }
  }

  /**
   * Handle update category request
   */
  async handleUpdateCategory(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const id = req.url.split('/').pop()!;
      const updates = req.body as Partial<Category>;

      // Validate max lengths if fields are provided
      if (updates.name !== undefined) {
        if (!updates.name) {
          return new BadRequestResponse('Name cannot be empty');
        }
        if (updates.name.length > 32) {
          return new BadRequestResponse('Name must not exceed 32 characters');
        }
        updates.name = updates.name.trim();
      }

      if (updates.description !== undefined) {
        if (!updates.description) {
          return new BadRequestResponse('Description cannot be empty');
        }
        if (updates.description.length > 128) {
          return new BadRequestResponse('Description must not exceed 128 characters');
        }
        updates.description = updates.description.trim();
      }

      await this.categoryRepo.update(id, updates);
      
      const updatedCategory = await this.categoryRepo.getById(id);
      if (!updatedCategory) {
        return new NotFoundResponse('Category not found');
      }

      return new OkResponse(updatedCategory);
    } catch (err) {
      console.error('Failed to update category:', err);
      return new ServerErrorResponse('Failed to update category');
    }
  }

  /**
   * Handle delete category request
   */
  async handleDeleteCategory(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const id = req.url.split('/').pop()!;

      // Check if category has products
      const products = await this.productRepo.getByCategoryId(id);
      if (products.length > 0) {
        return new BadRequestResponse('Cannot delete category with existing products');
      }

      await this.categoryRepo.delete(id);
      return new NoContentResponse();
    } catch (err) {
      console.error('Failed to delete category:', err);
      return new ServerErrorResponse('Failed to delete category');
    }
  }
}
