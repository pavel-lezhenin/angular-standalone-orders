import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userState = signal<AuthResponse['user'] | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly http = inject(HttpClient);

  readonly user = this.userState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: AuthCredentials): Observable<AuthResponse> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((response) => {
        this.setAuth(response);
        this.loadingState.set(false);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userState.set(null);
  }

  private setAuth(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    this.userState.set(response.user);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // In real app, verify token here
      // For demo, just mark as authenticated
      this.userState.set({
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
      });
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
