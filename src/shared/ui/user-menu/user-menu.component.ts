import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '@core/services/auth.service';

/**
 * User menu component with authentication-aware navigation.
 * Serves as the primary app-wide navigation dropdown.
 * Guest: Shop, Orders, Login
 * Authenticated: Shop, Orders, Account, [Admin], Logout
 */
@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
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

  /**
   * Universal navigation handler
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
