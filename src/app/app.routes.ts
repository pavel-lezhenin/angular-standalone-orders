import type { Routes } from '@angular/router';
import { adminGuard, authGuard } from '@core';
import { MainLayoutComponent } from '@/shared/ui/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('../areas/landing/components/landing.component').then(m => m.LandingComponent),
        title: 'Welcome - Orders Platform',
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () => import('../areas/orders/components/orders.component').then(m => m.OrdersComponent),
        title: 'Orders - Orders Platform',
      },
      {
        path: 'shop',
        // Public access - no authGuard for SEO and better UX
        // Users can browse products and add to cart (localStorage for guests)
        // Authentication required only at checkout
        loadComponent: () => import('../areas/shop/shop.component').then(m => m.default),
        title: 'Shop - Orders Platform',
      },
      {
        path: 'shop/product/:id',
        loadComponent: () => import('../areas/shop/shop-product-detail/shop-product-detail.component').then(m => m.default),
        title: 'Product Details - Shop',
      },
      {
        path: 'account',
        canActivate: [authGuard],
        loadComponent: () => import('../areas/account/components/account.component').then(m => m.AccountComponent),
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
