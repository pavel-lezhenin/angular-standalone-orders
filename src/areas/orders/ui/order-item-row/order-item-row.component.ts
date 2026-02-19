import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import type { ProductDTO } from '@core/models';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: ProductDTO;
}

/**
 * Order Item Row Component
 *
 * Displays a single order item (read-only) with:
 * - Product image and details
 * - Quantity
 * - Unit price
 * - Subtotal
 *
 * Used in checkout and order confirmation/details views.
 */
@Component({
  selector: 'app-order-item-row',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './order-item-row.component.html',
  styleUrl: './order-item-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderItemRowComponent {
  item = input.required<OrderItem>();

  /**
   * Calculate subtotal for this item
   */
  protected get subtotal(): number {
    return this.item().price * this.item().quantity;
  }
}
