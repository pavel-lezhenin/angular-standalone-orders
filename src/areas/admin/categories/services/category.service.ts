import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PermissionService } from '@core/services/permission.service';
import type { CategoryDTO } from '@core';
import type { PaginationParams, PaginatedResponse } from '@core/types';
import type {
  CategoryPermissions,
  CategoryFormData,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../model';

/**
 * Category service (admin area)
 *
 * Pure HTTP service for category CRUD operations
 * Uses HTTP requests that are intercepted by FakeBFFService
 *
 * State management is component's responsibility
 */
@Injectable()
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly permission = inject(PermissionService);
  private readonly apiUrl = '/api/categories';

  /**
   * Map form data to DTO
   */
  private mapFormToDto(formValue: CategoryFormData): Omit<CreateCategoryDto, 'id'> {
    return {
      name: formValue.name,
      description: formValue.description,
    };
  }

  /**
   * Get permissions for current user (synchronous)
   */
  getPermissions(): CategoryPermissions {
    return {
      canCreate: this.permission.hasAccess('categories', 'create'),
      canEdit: this.permission.hasAccess('categories', 'edit'),
      canDelete: this.permission.hasAccess('categories', 'delete'),
    };
  }

  /**
   * Load categories with pagination and filters
   */
  async loadCategories(
    params: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<CategoryDTO>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return firstValueFrom(
      this.http.get<PaginatedResponse<CategoryDTO>>(this.apiUrl, { params: httpParams })
    );
  }

  /**
   * Delete category by ID
   */
  async deleteCategory(categoryId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${categoryId}`));
  }

  /**
   * Create new category
   */
  async createCategory(formValue: CategoryFormData): Promise<CategoryDTO> {
    const dto: CreateCategoryDto = this.mapFormToDto(formValue);

    return firstValueFrom(this.http.post<CategoryDTO>(this.apiUrl, dto));
  }

  /**
   * Update existing category
   */
  async updateCategory(categoryId: string, formValue: CategoryFormData): Promise<CategoryDTO> {
    const dto: UpdateCategoryDto = this.mapFormToDto(formValue);

    return firstValueFrom(this.http.put<CategoryDTO>(`${this.apiUrl}/${categoryId}`, dto));
  }
}
