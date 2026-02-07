import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { DatabaseService, FakeBFFService, SeedService } from './core/bff';
import { AuthService } from './core/services/auth.service';
import { PermissionService } from './core/services/permission.service';
import { inject } from '@angular/core';
import { from, switchMap, Observable } from 'rxjs';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';

/**
 * API Interceptor (functional style for Angular 21+)
 */
const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const fakeBFF = inject(FakeBFFService);
  
  if (req.url.startsWith('/api/')) {
    return from(fakeBFF.handleRequest(req)).pipe(
      switchMap((response) => {
        return new Observable<HttpEvent<unknown>>((observer) => {
          observer.next(response);
          observer.complete();
        });
      }),
    );
  }
  
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([apiInterceptor])),
    // BFF Layer Services
    DatabaseService,
    FakeBFFService,
    AuthService,
    PermissionService,
    SeedService,
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
