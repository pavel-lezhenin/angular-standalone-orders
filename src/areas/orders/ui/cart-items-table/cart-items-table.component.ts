import { Component, input, output, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuantityControlComponent } from '@shared/ui/quantity-control/quantity-control.component';
import type { CartItemDTO, ProductDTO } from '@core/models';

/**
 * Extended cart item with product details and loading/error states
 */
export interface CartItemWithDetails extends CartItemDTO {
  product?: ProductDTO;
  loading?: boolean;
  error?: string;
}

/**
 * Cart Items Table Component
 *
 * Displays a table of cart items with:
 * - Select all checkbox
 * - Individual item rows with selection, quantity controls, etc.
 * - Responsive design
 *
 * Features:
 * - Bulk selection (select all/none)
 * - Individual item selection
 * - Quantity updates
 * - Item removal
 */
@Component({
  selector: 'app-cart-items-table',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    QuantityControlComponent,
  ],
  templateUrl: './cart-items-table.component.html',
  styleUrl: './cart-items-table.component.scss',
})
export class CartItemsTableComponent {
  items = input.required<CartItemWithDetails[]>();
  selectedItemIds = input<Set<string>>(new Set());
  
  itemSelectionChange = output<{ productId: string; selected: boolean }>();
  allSelectionChange = output<boolean>();
  quantityChange = output<{ productId: string; quantity: number }>();
  itemRemove = output<string>();

  /**
   * Check if all items are selected
   */
  protected allSelected = computed(() => {
    const items = this.items();
    const selected = this.selectedItemIds();
    return items.length > 0 && items.every(item => selected.has(item.productId));
  });

  /**
   * Check if some (but not all) items are selected
   */
  protected someSelected = computed(() => {
    const items = this.items();
    const selected = this.selectedItemIds();
    const selectedCount = items.filter(item => selected.has(item.productId)).length;
    return selectedCount > 0 && selectedCount < items.length;
  });

  protected isItemSelected(productId: string): boolean {
    return this.selectedItemIds().has(productId);
  }

  protected onToggleAll(): void {
    const selectAll = !this.allSelected();
    this.allSelectionChange.emit(selectAll);
  }

  protected onItemSelectionChange(productId: string, selected: boolean): void {
    this.itemSelectionChange.emit({ productId, selected });
  }

  protected onQuantityChange(productId: string, quantity: number): void {
    this.quantityChange.emit({ productId, quantity });
  }

  protected onItemRemove(productId: string): void {
    this.itemRemove.emit(productId);
  }
}
