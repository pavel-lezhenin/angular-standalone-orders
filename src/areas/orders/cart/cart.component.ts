import type { OnInit} from '@angular/core';
import { ChangeDetectionStrategy, Component, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { PageLoaderComponent } from '@shared/ui/page-loader/page-loader.component';
import { EmptyStateComponent, OrderSummaryComponent, TwoColumnLayoutComponent } from '@shared/ui';
import type { SummaryLine } from '@shared/ui/order-summary/order-summary.component';
import { CartService } from '@shared/services/cart.service';
import { NotificationService } from '@shared/services/notification.service';
import type { ProductDTO } from '@core/models';
import { CartItemsTableComponent, type CartItemWithDetails } from '../ui';

/**
 * Cart Page Component
 *
 * Features:
 * - Display cart items with product details
 * - Update quantities
 * - Remove items
 * - Show cart summary with taxes and total
 * - Empty state
 */
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    PageLoaderComponent,
    EmptyStateComponent,
    OrderSummaryComponent,
    CartItemsTableComponent,
    TwoColumnLayoutComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CartComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  protected cartService = inject(CartService);
  private notification = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  protected cartItems = signal<CartItemWithDetails[]>([]);
  protected loading = signal(true);
  protected hasLoaded = signal(false);
  protected selectedItems = signal<Set<string>>(new Set());

  /**
   * Tax rate (10%)
   */
  private readonly TAX_RATE = 0.1;

  /**
   * Check if any items are selected
   */
  protected hasSelectedItems = computed(() => this.selectedItems().size > 0);

  /**
   * Computed subtotal (only selected items)
   */
  protected subtotal = computed(() => {
    const selected = this.selectedItems();
    return this.cartItems().reduce((sum, item) => {
      if (item.product && selected.has(item.productId)) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);
  });

  /**
   * Computed tax amount
   */
  protected tax = computed(() => this.subtotal() * this.TAX_RATE);

  /**
   * Computed total
   */
  protected total = computed(() => this.subtotal() + this.tax());

  /**
   * Summary lines for order summary component
   */
  protected summaryLines = computed<SummaryLine[]>(() => [
    { label: 'Subtotal', value: this.subtotal() },
    { label: 'Tax (10%)', value: this.tax() },
  ]);

  /**
   * Check if cart is empty
   */
  protected isEmpty = computed(() => this.cartItems().length === 0);

  async ngOnInit(): Promise<void> {
    // Skip data loading on server (SSR)
    if (!this.isBrowser) {
      return;
    }

    await this.loadCartItems();
  }

  /**
   * Toggle item selection
   */
  protected onItemSelectionChange(event: { productId: string; selected: boolean }): void {
    this.selectedItems.update(selected => {
      const newSelected = new Set(selected);
      if (event.selected) {
        newSelected.add(event.productId);
      } else {
        newSelected.delete(event.productId);
      }
      return newSelected;
    });
  }

  /**
   * Toggle all items selection
   */
  protected onAllSelectionChange(selectAll: boolean): void {
    if (selectAll) {
      const allIds = this.cartItems().map(item => item.productId);
      this.selectedItems.set(new Set(allIds));
    } else {
      this.selectedItems.set(new Set());
    }
  }

  /**
   * Loads cart items and fetches product details
   */
  private async loadCartItems(): Promise<void> {
    this.loading.set(true);

    try {
      await this.cartService.waitForRestore();
      const items = this.cartService.getItems();

      if (items.length === 0) {
        this.cartItems.set([]);
        return;
      }

      // Initialize items with loading state
      const itemsWithDetails: CartItemWithDetails[] = items.map(item => ({
        ...item,
        loading: true,
      }));

      this.cartItems.set(itemsWithDetails);

      // Fetch all product details in ONE request
      const productIds = items.map(item => item.productId);
      const response = await firstValueFrom(
        this.http.post<{ products: ProductDTO[] }>('/api/products/batch', { productIds })
      );

      // Create a map for O(1) lookup
      const productsMap = new Map(
        response.products.map(product => [product.id, product])
      );

      // Update items with product details
      const updatedItems: CartItemWithDetails[] = items.map(item => {
        const product = productsMap.get(item.productId);
        
        if (product) {
          return {
            productId: item.productId,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
            product,
            loading: false,
          };
        } else {
          return {
            productId: item.productId,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
            loading: false,
            error: 'Failed to load product details',
          };
        }
      });

      this.cartItems.set(updatedItems);

      // Auto-select all items
      const allIds = items.map(item => item.productId);
      this.selectedItems.set(new Set(allIds));

    } catch (error) {
      console.error('Failed to load cart items:', error);
      this.notification.error('Failed to load cart items');
    } finally {
      this.hasLoaded.set(true);
      this.loading.set(false);
    }
  }

  /**
   * Handle quantity change from cart items table
   */
  protected onQuantityChange(event: { productId: string; quantity: number }): void {
    this.cartService.updateQuantity(event.productId, event.quantity);
    this.updateLocalItem(event.productId, event.quantity);
  }

  /**
   * Updates local item quantity without reloading
   */
  private updateLocalItem(productId: string, quantity: number): void {
    this.cartItems.update(items =>
      items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }

  /**
   * Removes item from cart
   */
  protected removeItem(productId: string): void {
    this.cartService.removeItem(productId);
    this.cartItems.update(items => items.filter(item => item.productId !== productId));
    this.selectedItems.update(selected => {
      const newSelected = new Set(selected);
      newSelected.delete(productId);
      return newSelected;
    });
    this.notification.success('Item removed from cart');
  }

  /**
   * Navigate to shop
   */
  protected continueShopping(): void {
    void this.router.navigate(['/shop']);
  }

  /**
   * Navigate to checkout with selected items only
   */
  protected proceedToCheckout(): void {
    if (!this.hasSelectedItems()) {
      this.notification.error('Please select items to checkout');
      return;
    }
    void this.router.navigate(['/orders/checkout']);
  }
}
