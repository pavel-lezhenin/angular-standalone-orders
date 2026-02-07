import type { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core';
 

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../pages/landing/landing.component').then(m => m.LandingComponent),
    title: 'Welcome - Orders Platform',
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
