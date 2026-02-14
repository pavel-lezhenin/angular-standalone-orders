import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { UserRepository } from '../repositories/user.repository';
import { randomDelay } from '../utils';
import type { User } from '../models';
import { OkResponse, CreatedResponse, NoContentResponse, NotFoundResponse, ServerErrorResponse } from './http-responses';
import { parsePaginationParams, applyPagination, createPaginatedResponse } from '../../core/types/pagination';

/**
 * User Handler Service
 * Handles user-related API requests
 */
@Injectable({
  providedIn: 'root',
})
export class UserHandlerService {
  constructor(private userRepo: UserRepository) {}

  /**
   * Handle get all users request with pagination, search, and filtering
   */
  async handleGetUsers(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const { page, limit, search, role } = parsePaginationParams(req.params);

      let users = await this.userRepo.getAll();

      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(user => 
          user.id.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.profile.firstName.toLowerCase().includes(searchLower) ||
          user.profile.lastName.toLowerCase().includes(searchLower) ||
          user.profile.phone.toLowerCase().includes(searchLower)
        );
      }

      if (role) {
        users = users.filter(user => user.role === role);
      }

      // Apply pagination
      const total = users.length;
      const paginatedUsers = applyPagination(users, page, limit);

      // Map to DTO (exclude password)
      const data = paginatedUsers.map(({ password, ...user }) => user);

      return new OkResponse(
        createPaginatedResponse(data, total, page, limit)
      );
    } catch (err) {
      console.error('Failed to fetch users:', err);
      return new ServerErrorResponse('Failed to fetch users');
    }
  }

  /**
   * Handle get user by ID request
   */
  async handleGetUser(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const id = req.url.split('/').pop()!;
      const user = await this.userRepo.getById(id);

      if (!user) {
        return new NotFoundResponse('User not found');
      }

      // Exclude password
      const { password, ...userWithoutPassword } = user;
      return new OkResponse(userWithoutPassword);
    } catch (err) {
      return new ServerErrorResponse('Failed to fetch user');
    }
  }

  /**
   * Handle create user request
   */
  async handleCreateUser(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const body = req.body as Partial<User>;
      
      const userData: User = {
        ...(body as User),
        id: body.id || crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await this.userRepo.create(userData);
      
      // Return without password
      const { password, ...userWithoutPassword } = userData;
      return new CreatedResponse(userWithoutPassword);
    } catch (err) {
      console.error('Failed to create user:', err);
      return new ServerErrorResponse('Failed to create user');
    }
  }

  /**
   * Handle update user request
   */
  async handleUpdateUser(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const id = req.url.split('/').pop()!;
      const updates = {
        ...(req.body as Partial<User>),
        updatedAt: Date.now(),
      };

      await this.userRepo.update(id, updates);
      
      const updatedUser = await this.userRepo.getById(id);
      if (!updatedUser) {
        return new NotFoundResponse('User not found');
      }

      // Return without password
      const { password, ...userWithoutPassword } = updatedUser;
      return new OkResponse(userWithoutPassword);
    } catch (err) {
      console.error('Failed to update user:', err);
      return new ServerErrorResponse('Failed to update user');
    }
  }

  /**
   * Handle delete user request
   */
  async handleDeleteUser(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const id = req.url.split('/').pop()!;
      await this.userRepo.delete(id);
      return new NoContentResponse();
    } catch (err) {
      console.error('Failed to delete user:', err);
      return new ServerErrorResponse('Failed to delete user');
    }
  }
}
