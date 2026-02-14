import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PermissionService } from '@core';
import { User } from '@bff';

/**
 * Customer service (admin area)
 * 
 * Handles business logic for admin customer CRUD operations
 * Uses HTTP requests that are intercepted by FakeBFFService
 */
@Injectable()
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly permission = inject(PermissionService);
  private readonly apiUrl = '/api/users';

  /**
   * Users list state
   */
  readonly users = signal<User[]>([]);

  /**
   * Loading state
   */
  readonly isLoading = signal(false);

  /**
   * Permissions
   */
  readonly canCreate = signal(false);
  readonly canEdit = signal(false);
  readonly canDelete = signal(false);

  /**
   * Initialize permissions for current user
   */
  async initPermissions(): Promise<void> {
    this.canCreate.set(await this.permission.hasAccess('customers', 'create'));
    this.canEdit.set(await this.permission.hasAccess('customers', 'edit'));
    this.canDelete.set(await this.permission.hasAccess('customers', 'delete'));
  }

  /**
   * Load all users
   */
  async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    try {
      const users = await firstValueFrom(this.http.get<User[]>(this.apiUrl));
      this.users.set(users);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Delete user by ID
   */
  async deleteUser(userId: string): Promise<void> {
    this.isLoading.set(true);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${userId}`));
      await this.loadUsers();
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Create new user
   */
  async createUser(formValue: any): Promise<void> {
    const newUser = {
      email: formValue.email,
      password: formValue.password,
      role: formValue.role,
      profile: {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phone: formValue.phone,
      },
    };

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.http.post<User>(this.apiUrl, newUser));
      await this.loadUsers();
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Update existing user
   */
  async updateUser(userId: string, formValue: any): Promise<void> {
    const updatedUser: Partial<User> = {
      email: formValue.email,
      role: formValue.role,
      profile: {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phone: formValue.phone,
      },
    };

    if (formValue.password) {
      updatedUser.password = formValue.password;
    }

    this.isLoading.set(true);
    try {
      await firstValueFrom(this.http.put<User>(`${this.apiUrl}/${userId}`, updatedUser));
      await this.loadUsers();
    } finally {
      this.isLoading.set(false);
    }
  }
}
