import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { CartService } from '@bff/entities/cart/cart.service';

/**
 * Cart button with badge showing item count
 */
@Component({
  selector: 'app-cart-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatBadgeModule],
  template: `
    <button 
      mat-icon-button 
      [matBadge]="cartService.itemCount()"
      [matBadgeHidden]="cartService.itemCount() === 0"
      matBadgeColor="accent"
      matBadgeSize="small"
      (click)="navigateToCart()"
      aria-label="Shopping cart">
      <mat-icon>shopping_cart</mat-icon>
    </button>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
  `],
})
export class CartButtonComponent {
  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  navigateToCart(): void {
    // TODO: Navigate to cart page when implemented
    this.router.navigate(['/shop/cart']);
  }
}
