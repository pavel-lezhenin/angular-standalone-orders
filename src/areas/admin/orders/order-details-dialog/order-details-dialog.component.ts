import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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

export interface OrderDetailsDialogData {
  order: OrderDTO;
  actor: OrderStatusChangeActorDTO;
  onAddComment: (orderId: string, payload: AddOrderCommentDTO) => Promise<OrderDTO>;
}

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './order-details-dialog.component.html',
  styleUrl: './order-details-dialog.component.scss',
})
export class OrderDetailsDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<OrderDetailsDialogComponent>);
  private readonly http = inject(HttpClient);
  protected readonly data = inject<OrderDetailsDialogData>(MAT_DIALOG_DATA);

  protected readonly order = signal<OrderDTO>(this.data.order);
  protected readonly isSavingComment = signal(false);
  protected readonly loadingProducts = signal(false);
  protected readonly productsError = signal<string | null>(null);
  protected readonly productLines = signal<readonly ProductLineItem[]>([]);
  protected readonly commentControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

  ngOnInit(): void {
    this.loadOrderProducts();
  }

  protected readonly timeline = computed<OrderTimelineItem[]>(() => {
    const currentOrder = this.order();

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

    this.isSavingComment.set(true);

    try {
      const updatedOrder = await this.data.onAddComment(this.order().id, {
        text: commentText,
        actor: this.data.actor,
      });
      this.order.set(updatedOrder);
      this.commentControl.setValue('');
      this.commentControl.markAsPristine();
      this.commentControl.markAsUntouched();
    } finally {
      this.isSavingComment.set(false);
    }
  }

  private async loadOrderProducts(): Promise<void> {
    this.loadingProducts.set(true);
    this.productsError.set(null);

    try {
      const lines = await Promise.all(
        this.order().items.map(async item => {
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

  protected close(): void {
    this.dialogRef.close(this.order());
  }
}
