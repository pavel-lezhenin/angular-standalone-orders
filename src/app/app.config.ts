import { ApplicationConfig, provideAppInitializer, PLATFORM_ID } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FakeBFFService } from './core/bff';
import { inject } from '@angular/core';
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
 * Only runs in browser (not in SSR)
 */
function initializeBFF(): Promise<void> {
  const platformId = inject(PLATFORM_ID);
  
  // Skip initialization on server
  if (!isPlatformBrowser(platformId)) {
    return Promise.resolve();
  }
  
  const fakeBFF = inject(FakeBFFService);
  return fakeBFF.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([apiInterceptor])),
    // Initialize BFF before app starts (Angular 21+ style)
    provideAppInitializer(initializeBFF),
  ],
};
