import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '@/app/core/services/auth.service';
import { CartButtonComponent } from '../cart-button/cart-button.component';

/**
 * User menu component with authentication-aware rendering
 */
@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    CartButtonComponent,
  ],
  template: `
    <div class="user-menu">
      <app-cart-button />
      
      @if (authService.currentUser(); as user) {
        <!-- Authenticated user menu -->
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
          <mat-icon>account_circle</mat-icon>
          <span class="user-name">{{ user.profile.firstName }}</span>
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="navigateToCart()">
            <mat-icon>shopping_cart</mat-icon>
            <span>Cart</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      } @else {
        <!-- Guest user - login button -->
        <button mat-raised-button color="primary" (click)="navigateToLogin()">
          Login
        </button>
      }
    </div>
  `,
  styles: [`
    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .user-name {
      margin: 0 0.25rem;
    }

    @media (max-width: 768px) {
      .user-name {
        display: none;
      }
    }
  `],
})
export class UserMenuComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToCart(): void {
    this.router.navigate(['/shop/cart']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
