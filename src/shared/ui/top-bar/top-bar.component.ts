import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import type { NavItem } from '@/shared/models';
import { UserMenuComponent } from '../user-menu/user-menu.component';

/**
 * Sticky top navigation bar with configurable menu items
 */
@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    UserMenuComponent,
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  @Input() title = 'Orders Platform';
  @Input() navItems: NavItem[] = [];
  @Input() showSidenavToggle = false;
  @Input() sidenavOpened = true;
  @Input() onToggleSidenav?: () => void;

  private readonly router = inject(Router);

  /**
   * Checks if a nav item corresponds to the current active route
   */
  isActive(item: NavItem): boolean {
    if (!item.route) {
      return false;
    }

    const currentUrl = this.router.url.split('?')[0] ?? '';

    // Exact match for home route to avoid matching everything
    if (item.route === '/') {
      return currentUrl === '/';
    }

    return currentUrl.startsWith(item.route);
  }

  handleNavClick(item: NavItem): void {
    if (item.action) {
      item.action();
    } else if (item.route) {
      void this.router.navigate([item.route]);
    }
  }

  handleSidenavToggle(): void {
    this.onToggleSidenav?.();
  }
}
