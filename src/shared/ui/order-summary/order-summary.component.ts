import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

/**
 * Summary line item for order summary display
 */
export interface SummaryLine {
  /**
   * Label text
   */
  label: string;
  /**
   * Value amount
   */
  value: number;
  /**
   * Optional CSS class for styling
   */
  class?: string;
}

/**
 * Reusable order summary component
 * 
 * Displays order summary with line items and total.
 * Used in cart, checkout, and payment flows.
 * 
 * @example
 * <app-order-summary
 *   [title]="'Order Summary'"
 *   [summaryLines]="[
 *     { label: 'Subtotal', value: 99.99 },
 *     { label: 'Tax (10%)', value: 10.00 }
 *   ]"
 *   [total]="109.99"
 * >
 *   <button mat-raised-button>Checkout</button>
 * </app-order-summary>
 */
@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
  ],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {
  /**
   * Summary card title
   * @default 'Order Summary'
   */
  readonly title = input<string>('Order Summary');

  /**
   * Array of summary line items (subtotal, tax, shipping, etc.)
   */
  readonly summaryLines = input<SummaryLine[]>([]);

  /**
   * Total amount
   */
  readonly total = input.required<number>();

  /**
   * Total label text
   * @default 'Total'
   */
  readonly totalLabel = input<string>('Total');

  /**
   * Show divider line before total
   * @default true
   */
  readonly showDivider = input<boolean>(true);

  /**
   * Visual variant
   * @default 'default'
   */
  readonly variant = input<'default' | 'compact' | 'card'>('default');
}
