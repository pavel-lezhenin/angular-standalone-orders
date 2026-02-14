import { ApplicationConfig, APP_INITIALIZER, PLATFORM_ID, inject } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FakeBFFService } from '@bff';
import { from, switchMap, Observable } from 'rxjs';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';

/**
 * API Interceptor (functional style for Angular 21+)
 * Only intercepts in browser, not in SSR
 */
const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const platformId = inject(PLATFORM_ID);
  
  // Skip interception on server - let requests go through
  if (!isPlatformBrowser(platformId)) {
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
    // Initialize BFF before app starts - using direct APP_INITIALIZER token for SSR compatibility
    {
      provide: APP_INITIALIZER,
      useFactory: initializeBFF,
      deps: [FakeBFFService, PLATFORM_ID],
      multi: true,
    },
  ],
};
