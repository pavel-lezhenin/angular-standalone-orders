import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../bff/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // In a real app, we'd get a token from auth service
    // For this demo, we'll just pass the request through

    const user = this.authService.getCurrentUser();

    if (user) {
      // Add mock authorization header
      // In production: get real JWT token from auth service
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer mock-token-for-${user.id}`,
        },
      });
      return next.handle(clonedReq);
    }

    return next.handle(req);
  }
}
