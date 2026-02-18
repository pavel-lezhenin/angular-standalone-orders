import { ApplicationConfig, APP_INITIALIZER, PLATFORM_ID, inject } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FakeBFFService } from '@bff';
import { AuthService } from '@core';
import { from, Observable, of } from 'rxjs';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';

function getSsrApiBody(req: HttpRequest<unknown>): unknown {
  const emptyPaginated = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

  if (req.url.endsWith('/api/auth/me')) {
    return { user: null };
  }

  if (req.url.endsWith('/api/auth/login')) {
    return { user: null, token: '' };
  }

  if (req.url.endsWith('/api/auth/logout')) {
    return { message: 'Logged out' };
  }

  if (req.url.includes('/api/users/check-email')) {
    return { exists: false };
  }

  if (req.url.endsWith('/api/orders')) {
    return { orders: [] };
  }

  if (req.url.match(/\/api\/users\/[\w-]+\/orders$/)) {
    return { orders: [] };
  }

  if (req.url.endsWith('/api/products/batch')) {
    return { products: [] };
  }

  if (req.url.endsWith('/api/products') || req.url.endsWith('/api/categories') || req.url.endsWith('/api/users')) {
    return emptyPaginated;
  }

  if (req.url.match(/\/api\/products\/[\w-]+$/)) {
    return { product: null };
  }

  if (req.url.match(/\/api\/orders\/[\w-]+$/)) {
    return { order: null };
  }

  return { message: 'SSR stub response' };
}

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
    if (!isPlatformBrowser(platformId)) {
      return Promise.resolve();
    }

    // Ensure BFF is initialized first
    try {
      // BFF should already be initializing, but make sure it's ready
      // If it hasn't started, this will be very fast
      if (!fakeBFF.isInitialized()) {
        await fakeBFF.initialize();
      }
    } catch (error) {
    }
    
    return authService.restoreSession().catch((error) => {
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
      return of(new HttpResponse({ status: 200, body: getSsrApiBody(req) }));
    }
    return next(req);
  }
  
  const fakeBFF = inject(FakeBFFService);
  
  if (req.url.startsWith('/api/')) {
    return from(fakeBFF.handleRequest(req));
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
    if (!isPlatformBrowser(platformId)) {
      return Promise.resolve();
    }
    
    return fakeBFF.initialize().then(() => {
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
    // Global Material Form Field configuration
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
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
