import { Routes } from '@angular/router';

/**
 * Authentication module routes.
 * 
 * Handles login, logout, and related authentication flows.
 */
export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
    title: 'Login - Orders Platform',
  },
];
