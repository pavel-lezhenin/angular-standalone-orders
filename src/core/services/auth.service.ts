import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { UserDTO } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<UserDTO | null>(null);

  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<UserDTO> {
    const response = await this.http
      .post<{ user: UserDTO; token: string }>('/api/auth/login', { email, password })
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

  getCurrentUser(): UserDTO | null {
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
      // For now, we just restore the UserDTO from session
      const response = await this.http.get<{ UserDTO: UserDTO }>('/api/auth/me').toPromise();
      if (response?.UserDTO) {
        this.currentUser.set(response.UserDTO);
      }
    }
  }

  /**
   * Get redirect path based on UserDTO role
   * @returns Path to redirect after login
   */
  getRedirectPath(): string {
    const UserDTO = this.currentUser();
    if (!UserDTO) {
      return '/auth/login';
    }

    // Admin and Manager → Admin panel
    if (UserDTO.role === 'admin' || UserDTO.role === 'manager') {
      return '/admin';
    }

    // Regular UserDTO → Shop
    return '/shop';
  }

  /**
   * Check if current UserDTO has admin or manager role
   */
  isAdminOrManager(): boolean {
    const UserDTO = this.currentUser();
    return UserDTO?.role === 'admin' || UserDTO?.role === 'manager';
  }

  /**
   * Check if current UserDTO has admin role
   */
  isAdmin(): boolean {
    const UserDTO = this.currentUser();
    return UserDTO?.role === 'admin';
  }
}
