import { ChangeDetectionStrategy, Component, OnInit, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageLoaderComponent } from '@shared/ui/page-loader/page-loader.component';
import { OrderService } from '@areas/orders/services/order.service';
import { NotificationService } from '@shared/services/notification.service';
import type { OrderDTO, ProductDTO } from '@core/models';

interface OrderItemWithProduct {
  productId: string;
  quantity: number;
  price: number;
  product?: ProductDTO;
}

/**
 * Order Confirmation Component
 *
 * Features:
 * - Success message with order number
 * - Order details with product information
 * - Delivery address
 * - Estimated delivery date
 * - Navigation to orders or shop
 */
@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    PageLoaderComponent,
  ],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  protected order = signal<OrderDTO | null>(null);
  protected orderItems = signal<OrderItemWithProduct[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  /**
   * Estimated delivery date (3 days from order creation)
   */
  protected estimatedDelivery = computed(() => {
    const orderData = this.order();
    if (!orderData) return null;

    const deliveryDate = new Date(orderData.createdAt);
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return deliveryDate;
  });

  async ngOnInit(): Promise<void> {
    // Skip data loading on server (SSR)
    if (!this.isBrowser) {
      return;
    }

    const orderId = this.route.snapshot.paramMap.get('id');

    if (!orderId) {
      this.notification.error('Order not found');
      this.router.navigate(['/shop']);
      return;
    }

    await this.loadOrder(orderId);
  }

  /**
   * Loads order details and product information
   */
  private async loadOrder(orderId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Load order
      const order = await this.orderService.getOrder(orderId);
      this.order.set(order);

      const productIds = [...new Set(order.items.map((item) => item.productId))];
      const response = await firstValueFrom(
        this.http.post<{ products: ProductDTO[] }>('/api/products/batch', { productIds })
      );
      const productsMap = new Map(response.products.map((product) => [product.id, product]));

      const itemsWithProducts = order.items.map((item) => ({
        ...item,
        product: productsMap.get(item.productId),
      }));

      this.orderItems.set(itemsWithProducts);
    } catch (err) {
      console.error('Failed to load order:', err);
      this.error.set('Failed to load order details. Please try again.');
      this.notification.error('Failed to load order details');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Navigate to shop
   */
  protected continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  /**
   * Navigate to orders page
   */
  protected viewOrders(): void {
    this.router.navigate(['/orders']);
  }
}
