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
import {
  ProductFormDialogComponent,
  ProductFormDialogData,
  ProductFormResult,
} from './product-form-dialog/product-form-dialog.component';
import { CreateProductDTO, UpdateProductDTO } from './model/types';

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

  /**
   * Selected product for edit/delete
   */
  private readonly selectedProductId = signal<string | null>(null);

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
    const dialogRef = this.dialog.open<
      ProductFormDialogComponent,
      ProductFormDialogData,
      ProductFormResult
    >(ProductFormDialogComponent, {
      data: {
        categories: this.categories(),
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.createProduct(result);
      }
    });
  }

  /**
   * Open edit dialog
   */
  protected async openEditDialog(productId: string): Promise<void> {
    try {
      // Load full product data
      const product = await this.productService.getProduct(productId);

      const dialogRef = this.dialog.open<
        ProductFormDialogComponent,
        ProductFormDialogData,
        ProductFormResult
      >(ProductFormDialogComponent, {
        data: {
          product,
          categories: this.categories(),
        },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.updateProduct(productId, result);
        }
      });
    } catch (err: unknown) {
      console.error('Failed to load product:', err);
      this.notificationService.error('Failed to load product data');
    }
  }

  /**
   * Create product
   */
  private async createProduct(formData: ProductFormResult): Promise<void> {
    this.startLoading();
    try {
      const productDTO: CreateProductDTO = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        stock: formData.stock,
        imageUrls: [], // Will be resolved from imageIds by BFF
        specifications: formData.specifications,
        imageUrl: '', // Legacy field
      };

      // Note: imageIds will be sent in request body but converted by BFF
      await this.productService.createProduct({
        ...productDTO,
        imageIds: formData.imageIds,
      } as CreateProductDTO & { imageIds: string[] });

      this.notificationService.success('Product created successfully');
      await this.loadProducts();
    } catch (err: unknown) {
      console.error('Failed to create product:', err);
      this.notificationService.error('Failed to create product');
    } finally {
      this.stopLoading();
    }
  }

  /**
   * Update product
   */
  private async updateProduct(
    productId: string,
    formData: ProductFormResult
  ): Promise<void> {
    this.startLoading();
    try {
      const productDTO: UpdateProductDTO = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        stock: formData.stock,
        imageUrls: [], // Will be resolved from imageIds by BFF
        specifications: formData.specifications,
        imageUrl: '', // Legacy field
      };

      await this.productService.updateProduct(productId, {
        ...productDTO,
        imageIds: formData.imageIds,
      } as UpdateProductDTO & { imageIds: string[] });

      this.notificationService.success('Product updated successfully');
      await this.loadProducts();
    } catch (err: unknown) {
      console.error('Failed to update product:', err);
      this.notificationService.error('Failed to update product');
    } finally {
      this.stopLoading();
    }
  }

  /**
   * Delete product with confirmation dialog
   * Prevents deletion if product has associated orders
   */
  protected async deleteProduct(productId: string): Promise<void> {
    const confirmed = confirm(
      'Are you sure you want to delete this product? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    this.startLoading();
    try {
      await this.productService.deleteProduct(productId);
      this.notificationService.success('Product deleted successfully');
      await this.loadProducts();
    } catch (err: unknown) {
      console.error('Failed to delete product:', err);
      
      // Check if error is due to existing orders
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete product';
      
      if (errorMessage.includes('order') || errorMessage.includes('Order')) {
        this.notificationService.error(
          'Cannot delete product: It has associated orders'
        );
      } else {
        this.notificationService.error('Failed to delete product');
      }
    } finally {
      this.stopLoading();
    }
  }
}
