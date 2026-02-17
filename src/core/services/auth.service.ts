import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { UserDTO } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<UserDTO | null>(null);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  async login(email: string, password: string): Promise<UserDTO> {
    const response = await firstValueFrom(
      this.http.post<{ user: UserDTO; token: string }>('/api/auth/login', { email, password })
    );

    if (!response?.user) {
      throw new Error('Login failed');
    }

    // Store token and user in localStorage for persistence across browser sessions
    if (this.isBrowser) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUserId', response.user.id);
    }
    this.currentUser.set(response.user);

    return response.user;
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post('/api/auth/logout', {}));
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUserId');
    }
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getCurrentUser(): UserDTO | null {
    return this.currentUser();
  }

  /**
   * Restores user session from storage.
   * Called on app initialization before route guards are checked.
   * 
   * If user was previously authenticated:
   * - Fetches fresh user data from /api/auth/me
   * - Restores currentUser signal
   * - CartService will auto-restore cart via effect
   * 
   * If no user in storage, does nothing (user stays null)
   */
  async restoreSession(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      console.log('⏭️ No userId in localStorage, skipping session restore');
      return;
    }

    console.log('🔍 Found userId in storage:', userId, '- fetching user data...');

    try {
      const response = await firstValueFrom(
        this.http.get<{ user: UserDTO }>('/api/auth/me')
      );
      if (response?.user) {
        this.currentUser.set(response.user);
        console.log('✅ User session restored:', response.user.email);
      } else {
        console.warn('⚠️ /api/auth/me returned empty response');
      }
    } catch (error) {
      console.warn('⚠️ Failed to restore session, clearing auth data', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUserId');
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
