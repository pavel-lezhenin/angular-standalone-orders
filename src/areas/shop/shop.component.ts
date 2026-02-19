import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  effect,
  afterNextRender,
} from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../admin/products/services/product.service';
import { CategoryService } from '../admin/categories/services/category.service';
import { CartService } from '@shared/services/cart.service';
import { LayoutService } from '@/shared/services/layout.service';
import { PageLoaderComponent } from '@shared/ui/page-loader';
import type { ProductWithCategoryDTO, CategoryDTO } from '@core';
import { NotificationService } from '@shared/services/notification.service';
import type { ShopFilters } from './shop-filters/shop-filters.component';
import { ShopFiltersComponent } from './shop-filters/shop-filters.component';
import { ShopProductListComponent } from './shop-product-list/shop-product-list.component';

/**
 * Shop Component (Public Product Catalog)
 *
 * Public access - no authentication required:
 * - SEO friendly - search engines can index products
 * - Guests can browse and add to cart (localStorage)
 * - Authenticated users get cart sync via IndexedDB
 * - Authentication required only at checkout
 *
 * Orchestrator component:
 * - Manages state and coordinates child components
 * - Delegates UI rendering to ShopFiltersComponent and ShopProductListComponent
 * - Handles data loading via ProductService and CategoryService
 */
@Component({
  selector: 'app-shop',
  standalone: true,
  providers: [ProductService, CategoryService],
  imports: [ShopFiltersComponent, ShopProductListComponent, PageLoaderComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ShopComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);
  private readonly layoutService = inject(LayoutService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  // State
  protected readonly products = signal<ProductWithCategoryDTO[]>([]);
  protected readonly categories = signal<CategoryDTO[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);

  private readonly pageSize = 12;
  private currentFilters: ShopFilters = { search: '' };

  constructor() {
    this.layoutService.setTitle('Shop - Orders Platform');
    this.layoutService.setNavItems([]);

    // Load data only in browser (after SSR hydration)
    // This prevents HTTP errors during server-side rendering
    afterNextRender(() => {
      void this.loadCategories();
      void this.loadProducts();
    });

    // Auto-reload when page changes
    effect(() => {
      const page = this.currentPage();
      if (page > 1) {
        void this.loadProducts();
      }
    });
  }

  private async loadCategories(): Promise<void> {
    try {
      const response = await this.categoryService.loadCategories({
        page: 1,
        limit: 100,
      });
      this.categories.set(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  private async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.productService.loadProducts({
        page: this.currentPage(),
        limit: this.pageSize,
        categoryId: this.currentFilters.categoryId,
        search: this.currentFilters.search || undefined,
      });

      // BFF returns ProductWithCategoryDTO[] with categoryName - no client JOIN needed
      this.products.set(response.data);
      this.totalPages.set(Math.ceil(response.total / this.pageSize));
    } catch (error) {
      console.error('Failed to load products:', error);
      this.notificationService.error('Failed to load products');
      this.products.set([]);
      this.totalPages.set(1);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onFiltersChange(filters: ShopFilters): void {
    this.currentFilters = filters;
    this.currentPage.set(1);
    void this.loadProducts();
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected onProductClick(productId: string): void {
    void this.router.navigate(['/shop/product', productId]);
  }

  protected onAddToCart(product: ProductWithCategoryDTO): void {
    this.cartService.addItem({
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: product.price,
    });
    this.notificationService.success(`${product.name} added to cart`);
  }
}
