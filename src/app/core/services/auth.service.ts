import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../bff/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<User> {
    const response = await this.http
      .post<{ user: User; token: string }>('/api/auth/login', { email, password })
      .toPromise();

    if (!response?.user) {
      throw new Error('Login failed');
    }

    // Store token and user
    sessionStorage.setItem('authToken', response.token);
    sessionStorage.setItem('currentUserId', response.user.id);
    this.currentUser.set(response.user);

    return response.user;
  }

  async logout(): Promise<void> {
    await this.http.post('/api/auth/logout', {}).toPromise();
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUserId');
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getCurrentUser(): User | null {
    if (!this.currentUser()) {
      const userId = sessionStorage.getItem('currentUserId');
      if (userId) {
        return this.currentUser();
      }
      return null;
    }
    return this.currentUser();
  }

  async restoreSession(): Promise<void> {
    const userId = sessionStorage.getItem('currentUserId');
    if (userId) {
      // In real app, would verify JWT token here
      // For now, we just restore the user from session
      const response = await this.http.get<{ user: User }>('/api/auth/me').toPromise();
      if (response?.user) {
        this.currentUser.set(response.user);
      }
    }
  }

  /**
   * Get redirect path based on user role
   * @returns Path to redirect after login
   */
  getRedirectPath(): string {
    const user = this.currentUser();
    if (!user) {
      return '/auth/login';
    }

    // Admin and Manager → Admin panel
    if (user.role === 'admin' || user.role === 'manager') {
      return '/admin';
    }

    // Regular User → Shop
    return '/shop';
  }

  /**
   * Check if current user has admin or manager role
   */
  isAdminOrManager(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin' || user?.role === 'manager';
  }

  /**
   * Check if current user has admin role
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin';
  }
}
