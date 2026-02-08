import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../app/core/services/auth.service';
import { TopBarComponent } from '../../shared/ui/top-bar/top-bar.component';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: ('admin' | 'manager')[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    TopBarComponent,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin', roles: ['admin', 'manager'] },
    { label: 'Orders Board', icon: 'view_kanban', route: '/admin/orders', roles: ['admin', 'manager'] },
    { label: 'Products', icon: 'inventory_2', route: '/admin/products', roles: ['admin', 'manager'] },
    { label: 'Categories', icon: 'category', route: '/admin/categories', roles: ['admin', 'manager'] },
    { label: 'Customers', icon: 'people', route: '/admin/customers', roles: ['admin'] },
    { label: 'Permissions', icon: 'admin_panel_settings', route: '/admin/permissions', roles: ['admin'] },
  ];

  currentUser = this.authService.currentUser;

  visibleMenuItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    return this.menuItems.filter(item => item.roles.includes(user.role as 'admin' | 'manager'));
  });

  constructor(private authService: AuthService) {}
}
