import type { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core';
import { MainLayoutComponent } from '@/shared/ui/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('../areas/landing/pages/landing.component').then(m => m.LandingComponent),
        title: 'Welcome - Orders Platform',
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () => import('../areas/orders/pages/orders.component').then(m => m.OrdersComponent),
        title: 'Orders - Orders Platform',
      },
      {
        path: 'shop',
        canActivate: [authGuard],
        loadComponent: () => import('../areas/orders/pages/orders.component').then(m => m.OrdersComponent),
        title: 'Shop - Orders Platform',
      },
      {
        path: 'account',
        canActivate: [authGuard],
        loadComponent: () => import('../areas/account/pages/account.component').then(m => m.AccountComponent),
        title: 'My Account - Orders Platform',
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('../areas/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('../areas/admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
