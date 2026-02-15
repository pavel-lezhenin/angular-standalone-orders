import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';

import { BaseComponent, CategoryDTO } from '@core';
import { generateDeleteMessage } from '@shared/utils';
import { ConfirmDialogService } from '@shared/ui/dialog';
import { PageLoaderComponent } from '@shared/ui/page-loader';
import { NotificationService } from '@shared/services/notification.service';
import {
  createFormDialogConfig,
  editFormDialogConfig,
} from '@shared/ui/dialog/dialog.config';
import { CategoryService } from './services/category.service';
import {
  CategoryFormDialogComponent,
  CategoryFormDialogData,
} from './category-form-dialog/category-form-dialog.component';
import { CategoryTableComponent } from './category-table/category-table.component';

/**
 * Categories management page (Admin only)
 *
 * Orchestrator component:
 * - Manages state and coordinates child components
 * - Delegates UI rendering to CategoryTableComponent
 * - Handles CRUD operations via CategoryService
 */
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    CategoryTableComponent,
    PageLoaderComponent,
  ],
  providers: [CategoryService],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent extends BaseComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly notificationService = inject(NotificationService);

  /**
   * Local state
   */
  protected readonly categories = signal<CategoryDTO[]>([]);
  protected readonly canCreate = signal(false);
  protected readonly canEdit = signal(false);
  protected readonly canDelete = signal(false);

  /**
   * Pagination state
   */
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly totalCategories = signal(0);
  protected readonly pageSizeOptions = [10, 20, 50, 100];

  async ngOnInit(): Promise<void> {
    this.initPermissions();
    await this.loadCategories();
  }

  /**
   * Initialize permissions (synchronous)
   */
  private initPermissions(): void {
    const permissions = this.categoryService.getPermissions();
    this.canCreate.set(permissions.canCreate);
    this.canEdit.set(permissions.canEdit);
    this.canDelete.set(permissions.canDelete);
  }

  /**
   * Load categories with pagination
   */
  private async loadCategories(): Promise<void> {
    this.startLoading();
    try {
      const response = await this.categoryService.loadCategories({
        page: this.currentPage(),
        limit: this.pageSize(),
      });

      this.categories.set(response.data);
      this.totalCategories.set(response.total);
    } catch (err: unknown) {
      console.error('Failed to load categories:', err);
      this.notificationService.error('Failed to load categories');
    } finally {
      this.stopLoading();
    }
  }

  /**
   * Handle pagination change from Material paginator
   */
  protected onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadCategories();
  }

  /**
   * Open create dialog
   */
  protected openCreateDialog(): void {
    this.dialog.open<CategoryFormDialogComponent, CategoryFormDialogData>(
      CategoryFormDialogComponent,
      {
        ...createFormDialogConfig('Create Category', 'Create'),
        data: {
          ...createFormDialogConfig('Create Category', 'Create').data,
          onSave: async (formValue) => {
            this.startLoading();
            try {
              await this.categoryService.createCategory(formValue);
              await this.loadCategories();
              this.notificationService.success('Category created successfully');
            } catch (err: unknown) {
              console.error('Failed to create category:', err);
              this.notificationService.error('Failed to create category');
              throw err;
            } finally {
              this.stopLoading();
            }
          },
        },
      }
    );
  }

  /**
   * Open edit dialog
   */
  protected openEditDialog(category: CategoryDTO): void {
    this.dialog.open<CategoryFormDialogComponent, CategoryFormDialogData>(
      CategoryFormDialogComponent,
      {
        ...editFormDialogConfig(category, 'Edit Category', 'category'),
        data: {
          ...editFormDialogConfig(category, 'Edit Category', 'category').data,
          onSave: async (formValue) => {
            this.startLoading();
            try {
              await this.categoryService.updateCategory(category.id, formValue);
              await this.loadCategories();
              this.notificationService.success('Category updated successfully');
            } catch (err: unknown) {
              console.error('Failed to update category:', err);
              this.notificationService.error('Failed to update category');
              throw err;
            } finally {
              this.stopLoading();
            }
          },
        },
      }
    );
  }

  /**
   * Delete category with confirmation dialog
   */
  protected deleteCategory(category: CategoryDTO): void {
    const message = generateDeleteMessage(category.name);
    
    this.confirmDialogService.openDeleteConfirm(
      message,
      async () => {
        await this.categoryService.deleteCategory(category.id);
        await this.loadCategories();
        this.notificationService.success('Category deleted successfully');
      },
      () => {
        console.log('Delete cancelled');
      }
    );
  }
}
