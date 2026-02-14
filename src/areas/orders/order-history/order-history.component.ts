import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { LayoutService } from '@/shared/services/layout.service';
import { OrderService } from '@shared/services/order.service';
import { AuthService } from '@core/services/auth.service';
import type { OrderDTO } from '@core/models';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="order-history-page">
      <h1>Your Orders</h1>
      
      @if (loading()) {
        <p class="loading">Loading orders...</p>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else {
        @if (orders().length === 0) {
          <p class="empty">No orders found</p>
        } @else {
          <table class="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total</th>
                <th>Status</th>
                <th>Delivery Address</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr class="clickable-row" (click)="viewOrderDetails(order.id)">
                  <td>#{{ order.id }}</td>
                  <td>{{ order.total | currency }}</td>
                  <td><span [class]="'status-' + order.status">{{ order.status }}</span></td>
                  <td class="address-cell">{{ order.deliveryAddress }}</td>
                  <td>{{ order.createdAt | date:'short' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      }
    </div>
  `,
  styles: [`
    .order-history-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #333;
      margin-bottom: 2rem;
    }
    
    .orders-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    
    .orders-table th {
      background: #f5f5f5;
      padding: 1rem;
      text-align: left;
      border-bottom: 2px solid #ddd;
      font-weight: 600;
    }
    
    .orders-table td {
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .clickable-row:hover {
      background-color: #f5f5f5;
    }
    
    .address-cell {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .status-queue {
      background: #fff3cd;
      color: #856404;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      text-transform: uppercase;
    }
    
    .status-processing {
      background: #cfe2ff;
      color: #084298;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      text-transform: uppercase;
    }
    
    .status-completed {
      background: #d4edda;
      color: #155724;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      text-transform: uppercase;
    }
    
    .empty,
    .loading,
    .error {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    
    .error {
      color: #d32f2f;
    }
  `],
})
export class OrderHistoryComponent implements OnInit {
  private layoutService = inject(LayoutService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  orders = signal<OrderDTO[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

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
  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/orders/confirmation', orderId]);
  }
}
