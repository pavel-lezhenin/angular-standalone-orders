import type { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core';
 

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../pages/home/home.component').then(m => m.HomeComponent),
    title: 'Home - Orders Platform',
  },
  {
    path: 'auth',
    loadChildren: () => import('../areas/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'shop',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/orders/orders.component').then(m => m.OrdersComponent),
    title: 'Shop - Orders Platform',
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('../pages/orders/orders.component').then(m => m.OrdersComponent),
    title: 'Admin - Orders Platform',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
