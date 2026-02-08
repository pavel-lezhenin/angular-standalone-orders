import { Routes } from '@angular/router';
import { adminGuard } from '../../app/core/guards/admin.guard';
import { AdminLayoutComponent } from './admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/orders-board.component').then(m => m.OrdersBoardComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/products.component').then(m => m.ProductsComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/categories.component').then(m => m.CategoriesComponent),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./customers/customers.component').then(m => m.CustomersComponent),
      },
      {
        path: 'permissions',
        loadComponent: () =>
          import('./permissions/permissions.component').then(m => m.PermissionsComponent),
      },
    ],
  },
];
