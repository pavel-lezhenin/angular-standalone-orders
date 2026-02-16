import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Reusable quantity control component
 * 
 * Provides increment/decrement buttons with quantity display.
 * Used in cart, product cards, and order management.
 * 
 * @example
 * <app-quantity-control
 *   [quantity]="5"
 *   [min]="1"
 *   [max]="99"
 *   (quantityChange)="updateQuantity($event)"
 * />
 */
@Component({
  selector: 'app-quantity-control',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './quantity-control.component.html',
  styleUrl: './quantity-control.component.scss',
})
export class QuantityControlComponent {
  /**
   * Current quantity value
   */
  readonly quantity = input.required<number>();

  /**
   * Minimum allowed quantity
   * @default 1
   */
  readonly min = input<number>(1);

  /**
   * Maximum allowed quantity (null = no limit)
   * @default null
   */
  readonly max = input<number | null>(null);

  /**
   * Disable all controls
   * @default false
   */
  readonly disabled = input<boolean>(false);

  /**
   * Visual size variant
   * @default 'default'
   */
  readonly size = input<'small' | 'default' | 'large'>('default');

  /**
   * Icon for decrement button
   * @default 'remove'
   */
  readonly decrementIcon = input<string>('remove');

  /**
   * Icon for increment button
   * @default 'add'
   */
  readonly incrementIcon = input<string>('add');

  /**
   * Emits new quantity value when changed
   */
  readonly quantityChange = output<number>();

  /**
   * Handle decrement button click
   */
  protected decrement(): void {
    const newQuantity = this.quantity() - 1;
    if (newQuantity >= this.min()) {
      this.quantityChange.emit(newQuantity);
    }
  }

  /**
   * Handle increment button click
   */
  protected increment(): void {
    const newQuantity = this.quantity() + 1;
    const maxValue = this.max();
    if (maxValue === null || newQuantity <= maxValue) {
      this.quantityChange.emit(newQuantity);
    }
  }

  /**
   * Check if decrement button should be disabled
   */
  protected isDecrementDisabled(): boolean {
    return this.disabled() || this.quantity() <= this.min();
  }

  /**
   * Check if increment button should be disabled
   */
  protected isIncrementDisabled(): boolean {
    const maxValue = this.max();
    return this.disabled() || (maxValue !== null && this.quantity() >= maxValue);
  }
}
