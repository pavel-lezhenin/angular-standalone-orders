import { Injectable, inject } from '@angular/core';
import type { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FakeBFFService } from '@bff';

/**
 * API Interceptor
 *
 * In development: Routes /api/* requests to FakeBFFService (mock backend)
 * In production: Would pass through to real backend
 *
 * Usage:
 * - Services make normal HTTP requests: this.http.post('/api/auth/login', ...)
 * - Interceptor automatically routes to FakeBFF in dev
 * - In production, remove this interceptor and configure real API base URL
 */
@Injectable()
export class APIInterceptor implements HttpInterceptor {
  private readonly fakeBFF = inject(FakeBFFService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // In development, route /api/* to FakeBFF
    if (request.url.startsWith('/api/')) {
      return from(this.fakeBFF.handleRequest(request)).pipe(
        switchMap((response) => {
          // Return the response from FakeBFF
          return new Observable<HttpEvent<unknown>>((observer) => {
            observer.next(response);
            observer.complete();
          });
        })
      );
    }

    // For non-API requests, pass through to real HTTP
    return next.handle(request);
  }
}
