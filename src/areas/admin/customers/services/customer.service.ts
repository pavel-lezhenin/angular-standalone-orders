import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PermissionService } from '@core/services/permission.service';
import { User } from '@bff/models';
import { PaginationParams, PaginatedResponse } from '@core/types';
import { 
  CustomerPermissions, 
  CustomerFormData, 
  CreateUserDto, 
  UpdateUserDto,
} from '../model';

/**
 * Customer service (admin area)
 * 
 * Pure HTTP service for customer CRUD operations
 * Uses HTTP requests that are intercepted by FakeBFFService
 * 
 * State management is component's responsibility
 */
@Injectable()
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly permission = inject(PermissionService);
  private readonly apiUrl = '/api/users';

  /**
   * Map form data to DTO with nested profile
   */
  private mapFormToDto(formValue: CustomerFormData): Omit<CreateUserDto, 'password'> & { password?: string } {
    const { email, role, password, ...profile } = formValue;
    
    return {
      email,
      role,
      profile,
      ...(password && { password }),
    };
  }

  /**
   * Get permissions for current user (synchronous)
   */
  getPermissions(): CustomerPermissions {
    return {
      canCreate: this.permission.hasAccess('customers', 'create'),
      canEdit: this.permission.hasAccess('customers', 'edit'),
      canDelete: this.permission.hasAccess('customers', 'delete'),
    };
  }

  /**
   * Load users with pagination and filters
   */
  async loadUsers(params: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResponse<User>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.role) {
      httpParams = httpParams.set('role', params.role);
    }

    return firstValueFrom(
      this.http.get<PaginatedResponse<User>>(this.apiUrl, { params: httpParams })
    );
  }

  /**
   * Delete user by ID
   */
  async deleteUser(userId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${userId}`));
  }

  /**
   * Create new user
   */
  async createUser(formValue: CustomerFormData): Promise<User> {
    const dto: CreateUserDto = {
      ...this.mapFormToDto(formValue),
      password: formValue.password,
    };

    return firstValueFrom(this.http.post<User>(this.apiUrl, dto));
  }

  /**
   * Update existing user
   */
  async updateUser(userId: string, formValue: CustomerFormData): Promise<User> {
    const dto = this.mapFormToDto(formValue) as UpdateUserDto;

    return firstValueFrom(this.http.put<User>(`${this.apiUrl}/${userId}`, dto));
  }
}
