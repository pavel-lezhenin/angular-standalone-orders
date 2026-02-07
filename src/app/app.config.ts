import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { DatabaseService, AuthService, PermissionService, SeedService } from './core';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    // BFF Layer Services
    DatabaseService,
    AuthService,
    PermissionService,
    SeedService,
    // HTTP Interceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};

/**
 * Initialize application: setup database and restore session
 */
export async function initializeApp(authService: AuthService, db: DatabaseService) {
  try {
    // Initialize IndexedDB
    await db.initialize();
    console.log('✅ Database initialized');

    // Initialize auth service (seed demo data if needed)
    await authService.initialize();
    console.log('✅ Auth service initialized');

    // Restore user session if exists
    await authService.restoreSession();
    console.log('✅ Session restored');
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    throw error;
  }
}
