import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { OrderDTO } from '@core/models';
import type { OrderStatus } from '@core/types';

/**
 * Order Card Component
 *
 * Displays an order in card format with:
 * - Order ID and date
 * - Status badge
 * - Total amount
 * - Delivery address
 * - Action buttons (view details, cancel)
 *
 * Features:
 * - Click to view details
 * - Cancel button for cancellable orders
 * - Responsive layout
 * - Status-based styling
 */
@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss',
})
export class OrderCardComponent {
  order = input.required<OrderDTO>();
  canceling = input<boolean>(false);
  
  click = output<string>();
  cancel = output<OrderDTO>();
  
  private readonly cancellableStatuses: readonly OrderStatus[] = ['pending_payment', 'paid'];

  protected canCancel(): boolean {
    return this.cancellableStatuses.includes(this.order().status);
  }

  protected onCardClick(): void {
    this.click.emit(this.order().id);
  }

  protected onCancelClick(event: Event): void {
    event.stopPropagation();
    this.cancel.emit(this.order());
  }

  protected getStatusClass(): string {
    return `status-${this.order().status}`;
  }

  protected getStatusLabel(): string {
    const status = this.order().status;
    return status.replace('_', ' ').toUpperCase();
  }
}
