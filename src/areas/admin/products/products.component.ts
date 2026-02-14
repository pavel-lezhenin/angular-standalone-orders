import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';

import { BaseComponent } from '@core';
import { CategoryDTO, ProductWithCategoryDTO } from '@core';
import { PageLoaderComponent } from '@shared/ui/page-loader';
import { NotificationService } from '@shared/services/notification.service';
import { ProductService } from './services/product.service';
import { CategoryService } from '../categories/services/category.service';
import { ProductTableComponent } from './product-table/product-table.component';
import {
  ProductFiltersComponent,
  ProductFilters,
} from './product-filters/product-filters.component';

/**
 * Products management page (Admin only)
 *
 * Orchestrator component:
 * - Manages state and coordinates child components
 * - Delegates UI rendering to ProductTableComponent and ProductFiltersComponent
 * - Handles CRUD operations via ProductService and CategoryService
 */
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    ProductTableComponent,
    ProductFiltersComponent,
    PageLoaderComponent,
  ],
  providers: [ProductService, CategoryService],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent extends BaseComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);

  /**
   * Local state
   */
  protected readonly products = signal<ProductWithCategoryDTO[]>([]);
  protected readonly categories = signal<CategoryDTO[]>([]);
  protected readonly canCreate = signal(false);
  protected readonly canEdit = signal(false);
  protected readonly canDelete = signal(false);

  /**
   * Pagination state
   */
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly totalProducts = signal(0);
  protected readonly pageSizeOptions = [10, 20, 50, 100];

  /**
   * Current filters
   */
  private readonly currentFilters = signal<ProductFilters>({
    search: '',
    categoryId: undefined,
  });

  async ngOnInit(): Promise<void> {
    this.initPermissions();
    // Load categories only for filter dropdown
    await this.loadCategories();
    await this.loadProducts();
  }

  /**
   * Initialize permissions (synchronous)
   */
  private initPermissions(): void {
    const permissions = this.productService.getPermissions();
    this.canCreate.set(permissions.canCreate);
    this.canEdit.set(permissions.canEdit);
    this.canDelete.set(permissions.canDelete);
  }

  /**
   * Load categories for filter dropdown
   */
  private async loadCategories(): Promise<void> {
    try {
      const response = await this.categoryService.loadCategories({ page: 1, limit: 100 });
      this.categories.set(response.data);
    } catch (err: unknown) {
      console.error('Failed to load categories:', err);
      this.notificationService.error('Failed to load categories');
    }
  }

  /**
   * Load products with pagination and filters
   * BFF returns ProductWithCategoryDTO[] with categoryName already populated
   */
  private async loadProducts(): Promise<void> {
    this.startLoading();
    try {
      const filters = this.currentFilters();
      const response = await this.productService.loadProducts({
        page: this.currentPage(),
        limit: this.pageSize(),
        search: filters.search || undefined,
        categoryId: filters.categoryId,
      });

      // BFF already returns products with categoryName - no enrichment needed
      this.products.set(response.data);
      this.totalProducts.set(response.total);
    } catch (err: unknown) {
      console.error('Failed to load products:', err);
      this.notificationService.error('Failed to load products');
    } finally {
      this.stopLoading();
    }
  }

  /**
   * Handle filters change from child component
   */
  protected onFiltersChange(filters: ProductFilters): void {
    this.currentFilters.set(filters);
    this.currentPage.set(1);
    this.loadProducts();
  }

  /**
   * Handle pagination change from Material paginator
   */
  protected onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadProducts();
  }

  /**
   * Open create dialog
   */
  protected openCreateDialog(): void {
    this.notificationService.success('Create product dialog - coming soon');
  }

  /**
   * Open edit dialog
   */
  protected openEditDialog(): void {
    this.notificationService.success('Edit product dialog - coming soon');
  }

  /**
   * Delete product with confirmation dialog
   */
  protected deleteProduct(): void {
    this.notificationService.success('Delete product - coming soon');
  }
}
