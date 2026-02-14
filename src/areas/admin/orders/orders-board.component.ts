import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '@shared/services/notification.service';
import { OrderService } from '@shared/services/order.service';
import type { OrderDTO } from '@core/models';
import type { OrderStatus } from '@core/types';

interface BoardColumnConfig {
  status: OrderStatus;
  title: string;
  description: string;
}

const BOARD_COLUMNS: BoardColumnConfig[] = [
  {
    status: 'pending_payment',
    title: 'Pending Payment',
    description: 'Waiting for customer payment',
  },
  {
    status: 'paid',
    title: 'Paid',
    description: 'New paid orders ready for processing',
  },
  {
    status: 'warehouse',
    title: 'Warehouse',
    description: 'Preparing orders in warehouse',
  },
  {
    status: 'courier_pickup',
    title: 'Courier Pickup',
    description: 'Ready for courier handoff',
  },
  {
    status: 'in_transit',
    title: 'In Transit',
    description: 'Orders on the way to customer',
  },
  {
    status: 'delivered',
    title: 'Delivered',
    description: 'Completed deliveries',
  },
  {
    status: 'cancelled',
    title: 'Cancelled',
    description: 'Cancelled orders',
  },
];

@Component({
  selector: 'app-orders-board',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './orders-board.component.html',
  styleUrl: './orders-board.component.scss',
})
export class OrdersBoardComponent implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private readonly notification = inject(NotificationService);
  private refreshTimerId: ReturnType<typeof setInterval> | null = null;

  protected readonly columns = BOARD_COLUMNS;
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly orders = signal<OrderDTO[]>([]);
  protected readonly lastUpdatedAt = signal<number | null>(null);

  protected readonly ordersByStatus = computed(() => {
    const currentOrders = this.orders();

    return this.columns.reduce<Record<OrderStatus, OrderDTO[]>>((acc, column) => {
      acc[column.status] = currentOrders
        .filter(order => order.status === column.status)
        .sort((left, right) => right.createdAt - left.createdAt);
      return acc;
    }, {
      pending_payment: [],
      paid: [],
      warehouse: [],
      courier_pickup: [],
      in_transit: [],
      delivered: [],
      cancelled: [],
    });
  });

  ngOnInit(): void {
    this.loadOrders();
    this.refreshTimerId = setInterval(() => {
      this.loadOrders({ silent: true });
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimerId) {
      clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  protected async refresh(): Promise<void> {
    await this.loadOrders();
  }

  protected getOrdersForStatus(status: OrderStatus): OrderDTO[] {
    return this.ordersByStatus()[status];
  }

  protected isRecentlyCreated(order: OrderDTO): boolean {
    return Date.now() - order.createdAt <= 5 * 60 * 1000;
  }

  private async loadOrders(options: { silent?: boolean } = {}): Promise<void> {
    const { silent = false } = options;

    if (!silent) {
      this.loading.set(true);
    }

    this.error.set(null);

    try {
      const orders = await this.orderService.getAllOrders();
      this.orders.set(orders);
      this.lastUpdatedAt.set(Date.now());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load orders board';
      this.error.set(message);

      if (!silent) {
        this.notification.error(message);
      }
    } finally {
      if (!silent) {
        this.loading.set(false);
      }
    }
  }
}
