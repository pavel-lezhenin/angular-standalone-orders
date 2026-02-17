import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderItemRowComponent, type OrderItem } from '../order-item-row/order-item-row.component';

/**
 * Order Items List Component
 *
 * Displays a list of order items in a vertical layout.
 * Used in checkout, order confirmation, and order details pages.
 *
 * Features:
 * - Responsive card-based layout
 * - Read-only display (no editing)
 * - Clean spacing between items
 */
@Component({
  selector: 'app-order-items-list',
  standalone: true,
  imports: [CommonModule, OrderItemRowComponent],
  templateUrl: './order-items-list.component.html',
  styleUrl: './order-items-list.component.scss',
})
export class OrderItemsListComponent {
  items = input.required<OrderItem[]>();
  title = input<string>('Order Items');
  showTitle = input<boolean>(true);
}
