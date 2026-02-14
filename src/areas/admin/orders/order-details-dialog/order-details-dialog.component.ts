import { Component, Input, OnChanges, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import type { OrderDTO, AddOrderCommentDTO, OrderStatusChangeActorDTO, ProductDTO } from '@core/models';

interface OrderTimelineItem {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  actor: string;
  type: 'system' | 'status' | 'comment';
}

interface ProductLineItem {
  productId: string;
  quantity: number;
  orderPrice: number;
  product?: ProductDTO;
}

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './order-details-dialog.component.html',
  styleUrl: './order-details-dialog.component.scss',
})
export class OrderDetailsDialogComponent implements OnChanges {
  private readonly http = inject(HttpClient);

  @Input({ required: true }) orderInput!: OrderDTO;
  @Input({ required: true }) actor!: OrderStatusChangeActorDTO;
  @Input({ required: true }) onAddComment!: (orderId: string, payload: AddOrderCommentDTO) => Promise<OrderDTO>;
  @Input() onOrderUpdated?: (order: OrderDTO) => void;

  protected readonly order = signal<OrderDTO | null>(null);
  protected readonly isSavingComment = signal(false);
  protected readonly loadingProducts = signal(false);
  protected readonly productsError = signal<string | null>(null);
  protected readonly productLines = signal<readonly ProductLineItem[]>([]);
  protected readonly commentControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  protected readonly quickActionNotes = [
    'Out of stock: initiate customer refund',
    'Address requires clarification from customer',
    'Courier assignment delayed due to capacity',
  ] as const;

  ngOnChanges(): void {
    if (!this.orderInput) {
      return;
    }

    this.order.set(this.orderInput);
    this.loadOrderProducts();
  }

  protected readonly timeline = computed<OrderTimelineItem[]>(() => {
    const currentOrder = this.order();
    if (!currentOrder) {
      return [];
    }

    const createdEvent: OrderTimelineItem = {
      id: `created-${currentOrder.id}`,
      createdAt: currentOrder.createdAt,
      title: 'Order created',
      description: 'Order was placed by customer',
      actor: `user:${currentOrder.userId}`,
      type: 'status',
    };

    const statusEvents: OrderTimelineItem[] = (currentOrder.statusHistory ?? []).map((entry, index) => ({
      id: `status-${index}-${entry.changedAt}`,
      createdAt: entry.changedAt,
      title: 'Status changed',
      description: `${entry.fromStatus} → ${entry.toStatus}`,
      actor: entry.actor.email ?? `${entry.actor.role}:${entry.actor.id}`,
      type: 'status',
    }));

    const commentEvents: OrderTimelineItem[] = (currentOrder.comments ?? []).map(comment => ({
      id: `comment-${comment.id}`,
      createdAt: comment.createdAt,
      title: comment.isSystem ? 'System note' : 'Manager comment',
      description: comment.text,
      actor: comment.actor.email ?? `${comment.actor.role}:${comment.actor.id}`,
      type: comment.isSystem ? 'system' : 'comment',
    }));

    return [createdEvent, ...statusEvents, ...commentEvents]
      .sort((left, right) => right.createdAt - left.createdAt);
  });

  protected async addComment(): Promise<void> {
    if (this.commentControl.invalid || this.isSavingComment()) {
      this.commentControl.markAsTouched();
      return;
    }

    const commentText = this.commentControl.value?.trim();
    if (!commentText) {
      return;
    }

    await this.submitComment(commentText, false);
  }

  protected async addQuickActionNote(note: string): Promise<void> {
    await this.submitComment(note, true);
  }

  private async loadOrderProducts(): Promise<void> {
    const currentOrder = this.order();
    if (!currentOrder) {
      this.productLines.set([]);
      return;
    }

    this.loadingProducts.set(true);
    this.productsError.set(null);

    try {
      const lines = await Promise.all(
        currentOrder.items.map(async item => {
          try {
            const response = await firstValueFrom(
              this.http.get<{ product: ProductDTO }>(`/api/products/${item.productId}`)
            );

            return {
              productId: item.productId,
              quantity: item.quantity,
              orderPrice: item.price,
              product: response.product,
            } satisfies ProductLineItem;
          } catch {
            return {
              productId: item.productId,
              quantity: item.quantity,
              orderPrice: item.price,
            } satisfies ProductLineItem;
          }
        })
      );

      this.productLines.set(lines);
    } catch {
      this.productsError.set('Unable to load product details');
    } finally {
      this.loadingProducts.set(false);
    }
  }

  private async submitComment(text: string, isSystem: boolean): Promise<void> {
    this.isSavingComment.set(true);

    try {
      const currentOrder = this.order();
      if (!currentOrder) {
        return;
      }

      const updatedOrder = await this.onAddComment(currentOrder.id, {
        text,
        actor: this.actor,
        isSystem,
      });
      this.order.set(updatedOrder);
      this.onOrderUpdated?.(updatedOrder);
      this.commentControl.setValue('');
      this.commentControl.markAsPristine();
      this.commentControl.markAsUntouched();
    } finally {
      this.isSavingComment.set(false);
    }
  }
}
