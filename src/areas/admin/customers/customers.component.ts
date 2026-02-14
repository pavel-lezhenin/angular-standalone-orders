import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';

import { UserDTO, BaseComponent } from '@core';
import { generateDeleteMessage } from '@shared/utils';
import { ConfirmDialogService } from '@shared/ui/dialog';
import { PageLoaderComponent } from '@shared/ui/page-loader';
import { NotificationService } from '@shared/services/notification.service';
import {
  createFormDialogConfig,
  editFormDialogConfig,
} from '@shared/ui/dialog/dialog.config';
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
    PageLoaderComponent,
  ],
  providers: [CustomerService],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
})
export class CustomersComponent extends BaseComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly notificationService = inject(NotificationService);

  /**
   * Local state
   */
  protected readonly users = signal<UserDTO[]>([]);
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
    this.startLoading();
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
    } catch (err: unknown) {
      console.error('Failed to load users:', err);
      this.notificationService.error('Failed to load users');
    } finally {
      this.stopLoading();
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
    const dialogRef = this.dialog.open(
      CustomerFormDialogComponent,
      createFormDialogConfig('Create Customer', 'Create')
    );

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.formValue) {
        this.startLoading();
        try {
          await this.customerService.createUser(result.formValue);
          await this.loadUsers();
          this.notificationService.success('User created successfully');
        } catch (err: unknown) {
          console.error('Failed to create user:', err);
          this.notificationService.error('Failed to create user');
        } finally {
          this.stopLoading();
        }
      }
    });
  }

  /**
   * Open edit dialog
   */
  protected openEditDialog(user: UserDTO): void {
    const dialogRef = this.dialog.open(
      CustomerFormDialogComponent,
      editFormDialogConfig(user, 'Edit Customer')
    );

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result?.formValue) {
        this.startLoading();
        try {
          await this.customerService.updateUser(user.id, result.formValue);
          await this.loadUsers();
          this.notificationService.success('User updated successfully');
        } catch (err: unknown) {
          console.error('Failed to update user:', err);
          this.notificationService.error('Failed to update user');
        } finally {
          this.stopLoading();
        }
      }
    });
  }

  /**
   * Delete user with confirmation dialog
   */
  protected deleteUser(user: UserDTO): void {
    const fullName = `${user.profile.firstName} ${user.profile.lastName}`;
    const message = generateDeleteMessage(fullName, user.email);
    
    this.confirmDialogService.openDeleteConfirm(
      message,
      async () => {
        await this.customerService.deleteUser(user.id);
        await this.loadUsers();
        this.notificationService.success('User deleted successfully');
      },
      () => {
        this.notificationService.error('Failed to delete user');
      }
    );
  }
}
