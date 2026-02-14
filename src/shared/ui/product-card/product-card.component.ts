import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductWithCategoryDTO } from '@core';
import { DEFAULT_PRODUCT_IMAGE } from '@shared/constants/product.constants';

/**
 * Product Card Component
 * Displays product information in a card layout
 * 
 * Features:
 * - Shows product image, name, price, category, stock status
 * - Optional "Add to Cart" button (via showAddToCart flag)
 * - Click on card navigates to product details
 * - Click on cart button adds to cart
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [DecimalPipe, MatButtonModule, MatIconModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  product = input.required<ProductWithCategoryDTO>();
  showAddToCart = input<boolean>(false);
  
  cardClick = output<string>();
  addToCart = output<ProductWithCategoryDTO>();

  get productImage(): string {
    return this.product().imageUrl || DEFAULT_PRODUCT_IMAGE;
  }

  get isLowStock(): boolean {
    return this.product().stock > 0 && this.product().stock <= 10;
  }

  get isOutOfStock(): boolean {
    return this.product().stock === 0;
  }

  onClick(): void {
    this.cardClick.emit(this.product().id);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation(); // Prevent card click
    this.addToCart.emit(this.product());
  }
}
