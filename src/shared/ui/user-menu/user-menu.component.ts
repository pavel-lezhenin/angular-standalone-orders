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
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
})
export class UserMenuComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  /**
   * Get display name based on user role
   */
  getUserDisplayName(role?: string): string {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'user':
        return 'User';
      default:
        return 'User';
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  navigateToAccount(): void {
    this.router.navigate(['/account']);
  }

  navigateToCart(): void {
    this.router.navigate(['/shop/cart']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
