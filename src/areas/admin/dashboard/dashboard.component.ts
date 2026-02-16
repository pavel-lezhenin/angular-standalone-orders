import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { EmptyStateComponent } from '@shared/ui';
import type { OrderDTO, ProductDTO, UserDTO } from '@core/models';
import type { PaginatedResponse } from '@core/types';

interface DashboardStat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly lastUpdatedAt = signal<number | null>(null);
  protected readonly stats = signal<DashboardStat[]>([]);
  protected readonly recentOrders = signal<readonly OrderDTO[]>([]);

  protected readonly hasData = computed(() => this.stats().length > 0);

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    await this.loadDashboardData();
  }

  protected formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  private async loadDashboardData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [ordersResponse, productsResponse, usersResponse] = await Promise.all([
        firstValueFrom(this.http.get<{ orders: OrderDTO[] }>('/api/orders')),
        firstValueFrom(
          this.http.get<PaginatedResponse<ProductDTO>>('/api/products', {
            params: { page: 1, limit: 1 },
          })
        ),
        firstValueFrom(
          this.http.get<PaginatedResponse<UserDTO>>('/api/users', {
            params: { page: 1, limit: 1 },
          })
        ),
      ]);

      const orders = [...ordersResponse.orders].sort((a, b) => b.createdAt - a.createdAt);
      const revenue = orders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.total, 0);

      this.stats.set([
        { label: 'Total Orders', value: orders.length, icon: 'shopping_cart', color: 'primary' },
        { label: 'Total Products', value: productsResponse.total, icon: 'inventory_2', color: 'success' },
        { label: 'Total Customers', value: usersResponse.total, icon: 'people', color: 'warning' },
        {
          label: 'Total Revenue',
          value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
            revenue
          ),
          icon: 'attach_money',
          color: 'info',
        },
      ]);

      this.recentOrders.set(orders.slice(0, 5));
      this.lastUpdatedAt.set(Date.now());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      this.error.set('Failed to load dashboard data. Please refresh the page.');
    } finally {
      this.loading.set(false);
    }
  }
}
