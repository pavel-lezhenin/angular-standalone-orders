import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'orders',
    loadComponent: () => import('../pages/orders/orders.component').then(m => m.OrdersComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
