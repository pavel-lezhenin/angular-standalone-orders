import { Component, OnInit, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from '@/shared/services/layout.service';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';
import { EmptyStateComponent } from '@shared/ui';
import { OrderService } from '@shared/services/order.service';
import { AuthService } from '@core/services/auth.service';
import type { OrderDTO } from '@core/models';
import { OrderCardComponent } from '../ui';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, PaginationComponent, EmptyStateComponent, OrderCardComponent],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss',
})
export class OrderHistoryComponent implements OnInit {
  private layoutService = inject(LayoutService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  protected readonly orders = signal<OrderDTO[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 10;
  protected readonly cancelingOrderIds = signal<readonly string[]>([]);

  protected readonly totalPages = computed(() => {
    const pages = Math.ceil(this.orders().length / this.pageSize);
    return Math.max(1, pages);
  });

  protected readonly paginatedOrders = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.orders().slice(startIndex, startIndex + this.pageSize);
  });

  async ngOnInit(): Promise<void> {
    this.layoutService.setTitle('Orders Platform');
    this.layoutService.setNavItems([]);

    // Skip data loading on server (SSR)
    if (!this.isBrowser) {
      return;
    }

    await this.loadOrders();
  }

  /**
   * Loads user orders
   */
  private async loadOrders(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) {
      this.error.set('You must be logged in to view orders');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const orders = await this.orderService.getUserOrders(user.id);
      // Sort by creation date (newest first)
      orders.sort((a, b) => b.createdAt - a.createdAt);
      this.orders.set(orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
      this.error.set('Failed to load orders. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Navigates to order details page
   */
  protected onOrderClick(orderId: string): void {
    this.router.navigate(['/orders/details', orderId]);
  }

  protected isCanceling(orderId: string): boolean {
    return this.cancelingOrderIds().includes(orderId);
  }

  protected async onCancelOrder(order: OrderDTO): Promise<void> {
    if (this.isCanceling(order.id)) {
      return;
    }

    const actor = this.authService.currentUser();
    if (!actor) {
      this.error.set('You must be logged in to cancel an order');
      return;
    }

    this.cancelingOrderIds.update(ids => [...ids, order.id]);

    try {
      const updatedOrder = await this.orderService.updateOrderStatus(order.id, {
        status: 'cancelled',
        actor: {
          id: actor.id,
          role: actor.role,
          email: actor.email,
        },
      });

      this.orders.update(currentOrders =>
        currentOrders.map(item => (item.id === updatedOrder.id ? updatedOrder : item))
      );
    } catch (err) {
      console.error('Failed to cancel order:', err);
      this.error.set('Failed to cancel order. Please try again.');
    } finally {
      this.cancelingOrderIds.update(ids => ids.filter(id => id !== order.id));
    }
  }

  protected goToPage(page: number): void {
    const boundedPage = Math.max(1, Math.min(this.totalPages(), page));
    this.currentPage.set(boundedPage);
  }

  /**
   * Navigate to shop
   */
  protected goToShop(): void {
    this.router.navigate(['/shop']);
  }
}
