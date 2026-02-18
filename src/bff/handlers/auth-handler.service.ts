import { Injectable, inject } from '@angular/core';
import type { HttpRequest, HttpResponse } from '@angular/common/http';
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
  private readonly userRepo = inject(UserRepository);

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
  async handleLogout(_req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    return new OkResponse({ message: 'Logged out' });
  }

  /**
   * Handle get current user request
   * Restores user from localStorage userId (simulating JWT token validation)
   */
  async handleGetMe(_req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      // In real implementation, would extract user ID from JWT token
      // For demo, get userId from localStorage
      const userId = localStorage.getItem('currentUserId');
      
      if (!userId) {
        return new UnauthorizedResponse('No session found');
      }

      const user = await this.userRepo.getById(userId);
      
      if (!user) {
        return new UnauthorizedResponse('User not found');
      }

      return new OkResponse({ user });
    } catch (err) {
      console.error('Get me error:', err);
      return new ServerErrorResponse('Internal server error');
    }
  }
}
