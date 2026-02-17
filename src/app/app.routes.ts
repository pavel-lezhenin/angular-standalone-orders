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
        children: [
          {
            path: '',
            canActivate: [authGuard],
            loadComponent: () => import('../areas/orders/order-history/order-history.component').then(m => m.OrderHistoryComponent),
            title: 'Order History - Orders Platform',
          },
          {
            path: 'cart',
            // Public access - guests can view cart
            loadComponent: () => import('../areas/orders/cart/cart.component').then(m => m.default),
            title: 'Shopping Cart',
          },
          {
            path: 'checkout',
            // No authGuard - guests can checkout and create account during checkout
            loadComponent: () => import('../areas/orders/checkout/checkout.component').then(m => m.default),
            title: 'Checkout',
          },
          {
            path: 'payment',
            // No authGuard - guests can pay for their order
            loadComponent: () => import('../areas/orders/payment/payment.component').then(m => m.default),
            title: 'Payment',
          },
          {
            path: 'details/:id',
            canActivate: [authGuard],
            loadComponent: () => import('../areas/orders/order-confirmation/order-confirmation.component').then(m => m.default),
            title: 'Order Details',
          },
          {
            path: 'confirmation/:id',
            // Requires authentication to view order confirmation
            canActivate: [authGuard],
            loadComponent: () => import('../areas/orders/order-confirmation/order-confirmation.component').then(m => m.default),
            title: 'Order Confirmed',
          },
        ],
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
        loadComponent: () => import('../areas/account/account.component').then(m => m.AccountComponent),
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
