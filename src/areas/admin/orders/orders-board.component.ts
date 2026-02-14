import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from '@shared/services/notification.service';
import { OrderService } from '@shared/services/order.service';
import { DialogComponent } from '@shared/ui/dialog';
import type { AddOrderCommentDTO, OrderDTO, OrderStatusChangeActorDTO } from '@core/models';
import type { OrderStatus } from '@core/types';
import { AuthService } from '@core/services/auth.service';
import { OrderDetailsDialogComponent } from './order-details-dialog/order-details-dialog.component';

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
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './orders-board.component.html',
  styleUrl: './orders-board.component.scss',
})
export class OrdersBoardComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly notification = inject(NotificationService);
  private refreshTimerId: ReturnType<typeof setInterval> | null = null;

  protected readonly columns = BOARD_COLUMNS;
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly orders = signal<OrderDTO[]>([]);
  protected readonly movingOrderIds = signal<readonly string[]>([]);
  protected readonly lastUpdatedAt = signal<number | null>(null);
  protected readonly connectedDropListIds = computed(() => this.columns.map(column => this.getDropListId(column.status)));

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
    this.setDraggingCursor(false);

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

  protected getDropListId(status: OrderStatus): string {
    return `orders-drop-${status}`;
  }

  protected isMoving(orderId: string): boolean {
    return this.movingOrderIds().includes(orderId);
  }

  protected onDragStarted(): void {
    this.setDraggingCursor(true);
  }

  protected onDragEnded(): void {
    this.setDraggingCursor(false);
  }

  protected async onDropOrder(event: CdkDragDrop<OrderDTO[]>, newStatus: OrderStatus): Promise<void> {
    const movedOrder = event.item.data as OrderDTO | undefined;
    if (!movedOrder || movedOrder.status === newStatus || this.isMoving(movedOrder.id)) {
      return;
    }

    const previousOrders = this.orders();
    const actor = this.getCurrentActor();
    const now = Date.now();

    this.movingOrderIds.update(ids => [...ids, movedOrder.id]);
    this.orders.update(currentOrders =>
      currentOrders.map(order =>
        order.id === movedOrder.id
          ? { ...order, status: newStatus, updatedAt: now }
          : order
      )
    );

    try {
      const updatedOrder = await this.orderService.updateOrderStatus(movedOrder.id, {
        status: newStatus,
        actor,
      });

      this.orders.update(currentOrders =>
        currentOrders.map(order => (order.id === updatedOrder.id ? updatedOrder : order))
      );
      this.lastUpdatedAt.set(Date.now());
    } catch (error) {
      this.orders.set(previousOrders);
      const message = error instanceof Error ? error.message : 'Failed to move order';
      this.notification.error(message);
    } finally {
      this.movingOrderIds.update(ids => ids.filter(id => id !== movedOrder.id));
    }
  }

  protected openOrderDetails(order: OrderDTO): void {
    this.dialog.open(DialogComponent, {
      width: '960px',
      maxWidth: '96vw',
      data: {
        title: `Order #${order.id.slice(0, 8)}`,
        type: 'notification',
        contentComponent: OrderDetailsDialogComponent,
        contentInputs: {
          orderInput: order,
          actor: this.getCurrentActor(),
          onAddComment: (orderId: string, payload: AddOrderCommentDTO) =>
            this.orderService.addOrderComment(orderId, payload),
          onOrderUpdated: (updatedOrder: OrderDTO) => {
            this.orders.update(currentOrders =>
              currentOrders.map(item => (item.id === updatedOrder.id ? updatedOrder : item))
            );
            this.lastUpdatedAt.set(Date.now());
          },
        },
      },
    });
  }

  private getCurrentActor(): OrderStatusChangeActorDTO {
    const actor = this.authService.currentUser();

    if (actor) {
      return {
        id: actor.id,
        role: actor.role,
        email: actor.email,
      };
    }

    return {
      id: 'manager-ui',
      role: 'manager',
    };
  }

  private setDraggingCursor(isDragging: boolean): void {
    if (!this.document?.body) {
      return;
    }

    this.document.body.style.cursor = isDragging ? 'grabbing' : '';
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
