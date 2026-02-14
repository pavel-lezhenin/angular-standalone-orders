import { ApplicationConfig, APP_INITIALIZER, PLATFORM_ID, inject } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FakeBFFService } from '@bff';
import { AuthService } from '@core';
import { from, switchMap, Observable } from 'rxjs';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';

/**
 * Restore authentication session on app startup
 * Called AFTER BFF is initialized (required for HTTP requests to work)
 * 
 * If user was previously authenticated:
 * - Fetches fresh user data from /api/auth/me
 * - Restores currentUser signal
 * - CartService will auto-restore cart via effect
 * 
 * Runs only in browser, not during SSR
 */
function restoreAuthSession(authService: AuthService, fakeBFF: FakeBFFService, platformId: Object): () => Promise<void> {
  return async () => {
    console.log('🔐 Auth session initializer executed');
    
    if (!isPlatformBrowser(platformId)) {
      console.log('⏭️ Skipping auth session restore (SSR)');
      return Promise.resolve();
    }

    // Ensure BFF is initialized first
    console.log('⏳ Waiting for BFF initialization before restoring session...');
    try {
      // BFF should already be initializing, but make sure it's ready
      // If it hasn't started, this will be very fast
      if (!fakeBFF.isInitialized()) {
        await fakeBFF.initialize();
      }
    } catch (error) {
      console.warn('⚠️ BFF initialization blocking session restore:', error);
    }
    
    console.log('🔄 Attempting to restore user session...');
    return authService.restoreSession().catch((error) => {
      console.warn('⚠️ Auth session restore failed:', error);
      // Don't throw - allow app to continue even if restore fails
    });
  };
}

/**
 * API Interceptor (functional style for Angular 21+)
 * Only intercepts in browser, not in SSR
 */
const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const platformId = inject(PLATFORM_ID);
  
  // During SSR: return empty responses for /api/ — no real backend exists
  if (!isPlatformBrowser(platformId)) {
    if (req.url.startsWith('/api/')) {
      return new Observable<HttpEvent<unknown>>((observer) => {
        observer.next(new HttpResponse({ status: 200, body: { data: [], total: 0, page: 1, limit: 20 } }));
        observer.complete();
      });
    }
    return next(req);
  }
  
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

/**
 * Initialize FakeBFF on app startup
 * This is the ONLY place where BFF initialization should happen
 * IMPORTANT: Must run in browser even after SSR hydration
 */
function initializeBFF(fakeBFF: FakeBFFService, platformId: Object): () => Promise<void> {
  return () => {
    console.log('🎯 BFF initializer factory executed');
    
    if (!isPlatformBrowser(platformId)) {
      console.log('⏭️ Skipping BFF init (SSR)');
      return Promise.resolve();
    }
    
    console.log('🚀 Starting BFF initialization (browser)');
    return fakeBFF.initialize().then(() => {
      console.log('✅ BFF initialization complete');
    }).catch((error) => {
      console.error('❌ BFF initialization failed:', error);
      throw error;
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideAnimations(), // Required for Material Dialog, Snackbar, etc.
    // Initialize BFF FIRST - required by restoreAuthSession
    {
      provide: APP_INITIALIZER,
      useFactory: initializeBFF,
      deps: [FakeBFFService, PLATFORM_ID],
      multi: true,
    },
    // Restore user session AFTER BFF is initialized - so HTTP requests work
    {
      provide: APP_INITIALIZER,
      useFactory: restoreAuthSession,
      deps: [AuthService, FakeBFFService, PLATFORM_ID],
      multi: true,
    },
  ],
};
