import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { UserRepository } from '../repositories/user.repository';
import { OkResponse, UnauthorizedResponse, ServerErrorResponse } from './http-responses';

/**
 * Auth Handler Service
 * Handles authentication-related API requests
 */
@Injectable({
  providedIn: 'root',
})
export class AuthHandlerService {
  constructor(private userRepo: UserRepository) {}

  /**
   * Handle login request
   */
  async handleLogin(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const user = await this.userRepo.getByEmail(email);

      if (!user) {
        return new UnauthorizedResponse('Invalid credentials');
      }

      if (user.password !== password) {
        return new UnauthorizedResponse('Invalid credentials');
      }

      return new OkResponse({ user, token: `mock-token-${user.id}` });
    } catch (err) {
      console.error('Login error:', err);
      return new ServerErrorResponse('Internal server error');
    }
  }

  /**
   * Handle logout request
   */
  async handleLogout(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    return new OkResponse({ message: 'Logged out' });
  }

  /**
   * Handle get current user request
   */
  async handleGetMe(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    // In real implementation, would extract user from JWT token
    // For now, return empty since we handle this in AuthService
    return new OkResponse({ user: null });
  }
}
