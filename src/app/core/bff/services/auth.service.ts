import { Injectable, signal } from '@angular/core';
import { UserRepository } from '../repositories/user.repository';
import { SeedService } from './seed.service';
import { User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<User | null>(null);

  constructor(
    private userRepo: UserRepository,
    private seedService: SeedService,
  ) {}

  async initialize(): Promise<void> {
    // Seed demo data on first run
    const userCount = await this.userRepo.count();
    if (userCount === 0) {
      await this.seedService.seedAll();
    }
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.userRepo.getByEmail(email);

    if (!user) {
      throw new Error(`User ${email} not found`);
    }

    // Simple password comparison (demo only - NOT SECURE for production)
    if (user.password !== password) {
      throw new Error('Invalid password');
    }

    // Set current user in session storage
    sessionStorage.setItem('currentUserId', user.id);
    this.currentUser.set(user);

    return user;
  }

  async logout(): Promise<void> {
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
      const user = await this.userRepo.getById(userId);
      if (user) {
        this.currentUser.set(user);
      }
    }
  }
}
