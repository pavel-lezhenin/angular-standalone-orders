import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';

import { UserDTO } from '@core';
import { CustomerService } from './services/customer.service';
import { CustomerFormDialogComponent } from './customer-form-dialog/customer-form-dialog.component';
import { CustomerTableComponent } from './customer-table/customer-table.component';
import {
  CustomerFiltersComponent,
  CustomerFilters,
} from './customer-filters/customer-filters.component';

/**
 * Customers management page (Admin only)
 *
 * Orchestrator component:
 * - Manages state and coordinates child components
 * - Delegates UI rendering to CustomerTableComponent and CustomerFiltersComponent
 * - Handles CRUD operations via CustomerService
 */
@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    CustomerTableComponent,
    CustomerFiltersComponent,
  ],
  providers: [CustomerService],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
})
export class CustomersComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Local state
   */
  protected readonly users = signal<UserDTO[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly canCreate = signal(false);
  protected readonly canEdit = signal(false);
  protected readonly canDelete = signal(false);

  /**
   * Pagination state
   */
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly totalUsers = signal(0);
  protected readonly pageSizeOptions = [10, 20, 50, 100];

  /**
   * Current filters
   */
  private readonly currentFilters = signal<CustomerFilters>({ search: '', role: undefined });

  async ngOnInit(): Promise<void> {
    this.initPermissions();
    await this.loadUsers();
  }

  /**
   * Initialize permissions (synchronous)
   */
  private initPermissions(): void {
    const permissions = this.customerService.getPermissions();
    this.canCreate.set(permissions.canCreate);
    this.canEdit.set(permissions.canEdit);
    this.canDelete.set(permissions.canDelete);
  }

  /**
   * Load users with pagination and filters
   */
  private async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    try {
      const filters = this.currentFilters();
      const response = await this.customerService.loadUsers({
        page: this.currentPage(),
        limit: this.pageSize(),
        search: filters.search || undefined,
        role: filters.role,
      });

      this.users.set(response.data);
      this.totalUsers.set(response.total);
    } catch (error) {
      console.error('Failed to load users:', error);
      this.showError('Failed to load users');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle filters change from child component
   */
  protected onFiltersChange(filters: CustomerFilters): void {
    this.currentFilters.set(filters);
    this.currentPage.set(1);
    this.loadUsers();
  }

  /**
   * Handle pagination change from Material paginator
   */
  protected onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadUsers();
  }

  /**
   * Open create dialog
   */
  protected openCreateDialog(): void {
    const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { mode: 'create' },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.formValue) {
        this.isLoading.set(true);
        try {
          await this.customerService.createUser(result.formValue);
          await this.loadUsers();
          this.showSuccess('User created successfully');
        } catch (error) {
          console.error('Failed to create user:', error);
          this.showError('Failed to create user');
        } finally {
          this.isLoading.set(false);
        }
      }
    });
  }

  /**
   * Open edit dialog
   */
  protected openEditDialog(user: UserDTO): void {
    const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { mode: 'edit', user },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.formValue) {
        this.isLoading.set(true);
        try {
          await this.customerService.updateUser(user.id, result.formValue);
          await this.loadUsers();
          this.showSuccess('User updated successfully');
        } catch (error) {
          console.error('Failed to update user:', error);
          this.showError('Failed to update user');
        } finally {
          this.isLoading.set(false);
        }
      }
    });
  }

  /**
   * Delete user with confirmation
   */
  protected async deleteUser(user: UserDTO): Promise<void> {
    if (!confirm(`Are you sure you want to delete user ${user.email}?`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      await this.customerService.deleteUser(user.id);
      await this.loadUsers();
      this.showSuccess('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      this.showError('Failed to delete user');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Show success notification
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success'],
    });
  }

  /**
   * Show error notification
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['snackbar-error'],
    });
  }
}
