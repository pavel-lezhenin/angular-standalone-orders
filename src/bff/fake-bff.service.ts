import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { DatabaseService } from './database.service';
import { UserRepository } from './repositories/user.repository';
import { ProductRepository } from './repositories/product.repository';
import { OrderRepository } from './repositories/order.repository';
import { CategoryRepository } from './repositories/category.repository';
import { CartRepository } from './repositories/cart.repository';
import { SeedService } from './services/seed.service';
import { randomDelay } from './utils';
import type { User, Product, Order, Category, Cart } from './models';

/**
 * FakeBFF Service
 * Simulates a real backend API using IndexedDB + repositories
 * In production, this will be replaced with actual HTTP calls to a real backend
 * 
 * Usage: Injected into HTTP Interceptor to handle /api/* requests
 */
@Injectable({
  providedIn: 'root',
})
export class FakeBFFService {
  private initialized = false;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private db: DatabaseService,
    private userRepo: UserRepository,
    private productRepo: ProductRepository,
    private orderRepo: OrderRepository,
    private categoryRepo: CategoryRepository,
    private cartRepo: CartRepository,
    private seedService: SeedService,
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('FakeBFF already initialized');
      return;
    }

    // Skip initialization on server
    if (!isPlatformBrowser(this.platformId)) {
      console.log('FakeBFFService: Skipping initialization (SSR)');
      this.initialized = true;
      return;
    }

    console.log('🚀 Initializing FakeBFF...');

    // Initialize database first
    await this.db.initialize();

    const userCount = await this.userRepo.count();
    console.log(`📊 Current user count: ${userCount}`);
    
    // Check if admin user exists
    const adminUser = await this.userRepo.getByEmail('admin@demo');
    console.log(`🔍 Admin user exists: ${!!adminUser}`);
    
    if (!adminUser) {
      console.log('📦 Admin user not found, reseeding database...');
      await this.seedService.seedAll();
    } else {
      console.log('✓ Database already has data');
    }

    this.initialized = true;
    console.log('✅ FakeBFF initialized successfully');
  }

  /**
   * Main handler for intercepted API requests
   * Routes to appropriate handler based on URL and method
   */
  async handleRequest(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await this.initialize();

    // Auth endpoints
    if (req.method === 'POST' && req.url.endsWith('/api/auth/login')) {
      return this.handleAuthLogin(req);
    }
    if (req.method === 'POST' && req.url.endsWith('/api/auth/logout')) {
      return this.handleAuthLogout(req);
    }
    if (req.method === 'GET' && req.url.endsWith('/api/auth/me')) {
      return this.handleAuthGetMe(req);
    }

    // Product endpoints
    if (req.method === 'GET' && req.url.endsWith('/api/products')) {
      return this.handleGetProducts(req);
    }
    if (req.method === 'GET' && req.url.match(/\/api\/products\/[\w-]+$/)) {
      return this.handleGetProduct(req);
    }

    // Category endpoints
    if (req.method === 'GET' && req.url.endsWith('/api/categories')) {
      return this.handleGetCategories(req);
    }
    if (req.method === 'POST' && req.url.endsWith('/api/categories')) {
      return this.handleCreateCategory(req);
    }
    if (req.method === 'PUT' && req.url.match(/\/api\/categories\/[\w-]+$/)) {
      return this.handleUpdateCategory(req);
    }
    if (req.method === 'DELETE' && req.url.match(/\/api\/categories\/[\w-]+$/)) {
      return this.handleDeleteCategory(req);
    }

    // Order endpoints
    if (req.method === 'GET' && req.url.endsWith('/api/orders')) {
      return this.handleGetOrders(req);
    }
    if (req.method === 'POST' && req.url.endsWith('/api/orders')) {
      return this.handleCreateOrder(req);
    }
    if (req.method === 'GET' && req.url.match(/\/api\/orders\/[\w-]+$/)) {
      return this.handleGetOrder(req);
    }

    // User endpoints
    if (req.method === 'GET' && req.url.includes('/api/users') && !req.url.includes('/cart')) {
      // Check if it's a specific user by ID (e.g., /api/users/123)
      const userIdMatch = req.url.match(/\/api\/users\/([\w-]+)$/);
      if (userIdMatch) {
        return this.handleGetUser(req);
      }
      // Otherwise, it's a list request
      return this.handleGetUsers(req);
    }
    if (req.method === 'POST' && req.url.endsWith('/api/users')) {
      return this.handleCreateUser(req);
    }
    if (req.method === 'PUT' && req.url.match(/\/api\/users\/[\w-]+$/) && !req.url.includes('/cart')) {
      return this.handleUpdateUser(req);
    }
    if (req.method === 'DELETE' && req.url.match(/\/api\/users\/[\w-]+$/) && !req.url.includes('/cart')) {
      return this.handleDeleteUser(req);
    }

    // Cart endpoints
    if (req.method === 'GET' && req.url.match(/\/api\/users\/[\w-]+\/cart$/)) {
      return this.handleGetCart(req);
    }
    if (req.method === 'PUT' && req.url.match(/\/api\/users\/[\w-]+\/cart$/)) {
      return this.handleUpdateCart(req);
    }
    if (req.method === 'POST' && req.url.match(/\/api\/users\/[\w-]+\/cart\/items$/)) {
      return this.handleAddCartItem(req);
    }
    if (req.method === 'DELETE' && req.url.match(/\/api\/users\/[\w-]+\/cart\/items\/[\w-]+$/)) {
      return this.handleRemoveCartItem(req);
    }

    return new HttpResponse({ status: 404, body: { error: 'Not found' } });
  }

  // Auth handlers
  private async handleAuthLogin(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const { email, password } = req.body as { email: string; password: string };
      console.log(`🔐 Login attempt for: ${email}`);
      
      const user = await this.userRepo.getByEmail(email);

      if (!user) {
        console.log(`❌ User not found: ${email}`);
        return new HttpResponse({
          status: 401,
          body: { error: 'Invalid credentials' },
        });
      }

      if (user.password !== password) {
        console.log(`❌ Invalid password for: ${email}`);
        return new HttpResponse({
          status: 401,
          body: { error: 'Invalid credentials' },
        });
      }

      console.log(`✅ Login successful: ${email} (${user.role})`);
      return new HttpResponse({
        status: 200,
        body: { user, token: `mock-token-${user.id}` },
      });
    } catch (err) {
      console.error('❌ Login error:', err);
      return new HttpResponse({
        status: 500,
        body: { error: 'Internal server error' },
      });
    }
  }

  private async handleAuthLogout(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    return new HttpResponse({ status: 200, body: { message: 'Logged out' } });
  }

  private async handleAuthGetMe(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    // In real implementation, would extract user from JWT token
    // For now, return empty since we handle this in AuthService
    return new HttpResponse({ status: 200, body: { user: null } });
  }

  // Product handlers
  private async handleGetProducts(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const products = await this.productRepo.getAll();
      return new HttpResponse({ status: 200, body: { products } });
    } catch (err) {
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to fetch products' },
      });
    }
  }

  private async handleGetProduct(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const id = req.url.split('/').pop()!;
      const product = await this.productRepo.getById(id);

      if (!product) {
        return new HttpResponse({ status: 404, body: { error: 'Product not found' } });
      }

      return new HttpResponse({ status: 200, body: { product } });
    } catch (err) {
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to fetch product' },
      });
    }
  }

  // Category handlers
  private async handleGetCategories(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      // Parse query parameters
      const page = parseInt(req.params.get('page') || '1');
      const limit = parseInt(req.params.get('limit') || '20');
      const search = req.params.get('search') || '';

      // Get all categories
      let categories = await this.categoryRepo.getAll();

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        categories = categories.filter(category => 
          category.name.toLowerCase().includes(searchLower) ||
          category.description.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const total = categories.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCategories = categories.slice(startIndex, endIndex);

      return new HttpResponse({ 
        status: 200, 
        body: { 
          data: paginatedCategories,
          total,
          page,
          limit,
        } 
      });
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to fetch categories' },
      });
    }
  }

  private async handleCreateCategory(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const body = req.body as Partial<Category>;
      
      // Validate required fields
      if (!body.name || !body.description) {
        return new HttpResponse({
          status: 400,
          body: { error: 'Name and description are required' },
        });
      }

      // Validate max lengths
      if (body.name.length > 32) {
        return new HttpResponse({
          status: 400,
          body: { error: 'Name must not exceed 32 characters' },
        });
      }

      if (body.description.length > 128) {
        return new HttpResponse({
          status: 400,
          body: { error: 'Description must not exceed 128 characters' },
        });
      }
      
      const categoryData: Category = {
        id: crypto.randomUUID(),
        name: body.name.trim(),
        description: body.description.trim(),
      };

      await this.categoryRepo.create(categoryData);
      
      return new HttpResponse({ status: 201, body: categoryData });
    } catch (err) {
      console.error('Failed to create category:', err);
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to create category' },
      });
    }
  }

  private async handleUpdateCategory(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const id = req.url.split('/').pop()!;
      const updates = req.body as Partial<Category>;

      // Validate max lengths if fields are provided
      if (updates.name !== undefined) {
        if (!updates.name) {
          return new HttpResponse({
            status: 400,
            body: { error: 'Name cannot be empty' },
          });
        }
        if (updates.name.length > 32) {
          return new HttpResponse({
            status: 400,
            body: { error: 'Name must not exceed 32 characters' },
          });
        }
        updates.name = updates.name.trim();
      }

      if (updates.description !== undefined) {
        if (!updates.description) {
          return new HttpResponse({
            status: 400,
            body: { error: 'Description cannot be empty' },
          });
        }
        if (updates.description.length > 128) {
          return new HttpResponse({
            status: 400,
            body: { error: 'Description must not exceed 128 characters' },
          });
        }
        updates.description = updates.description.trim();
      }

      await this.categoryRepo.update(id, updates);
      
      const updatedCategory = await this.categoryRepo.getById(id);
      if (!updatedCategory) {
        return new HttpResponse({ status: 404, body: { error: 'Category not found' } });
      }

      return new HttpResponse({ status: 200, body: updatedCategory });
    } catch (err) {
      console.error('Failed to update category:', err);
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to update category' },
      });
    }
  }

  private async handleDeleteCategory(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const id = req.url.split('/').pop()!;

      // Check if category has products
      const products = await this.productRepo.getByCategoryId(id);
      if (products.length > 0) {
        return new HttpResponse({
          status: 400,
          body: { error: 'Cannot delete category with existing products' },
        });
      }

      await this.categoryRepo.delete(id);
      return new HttpResponse({ status: 204, body: null });
    } catch (err) {
      console.error('Failed to delete category:', err);
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to delete category' },
      });
    }
  }

  // User handlers
  private async handleGetUsers(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      // Parse query parameters from HttpRequest.params (Angular stores them separately)
      const page = parseInt(req.params.get('page') || '1');
      const limit = parseInt(req.params.get('limit') || '20');
      const search = req.params.get('search') || '';
      const role = req.params.get('role') || undefined;

      // Get all users
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
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);

      // Map to DTO (exclude password)
      const data = paginatedUsers.map(({ password, ...user }) => user);

      return new HttpResponse({ 
        status: 200, 
        body: { 
          data,
          total,
          page,
          limit,
        } 
      });
    } catch (err) {
      console.error('Failed to fetch users:', err);
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to fetch users' },
      });
    }
  }

  private async handleGetUser(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const id = req.url.split('/').pop()!;
      const user = await this.userRepo.getById(id);

      if (!user) {
        return new HttpResponse({ status: 404, body: { error: 'User not found' } });
      }

      // Exclude password
      const { password, ...userWithoutPassword } = user;
      return new HttpResponse({ status: 200, body: userWithoutPassword });
    } catch (err) {
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to fetch user' },
      });
    }
  }

  private async handleCreateUser(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const body = req.body as Partial<User>;
      
      // Create user with all required fields
      const userData: User = {
        ...(body as User),
        id: body.id || crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await this.userRepo.create(userData);
      
      // Return without password
      const { password, ...userWithoutPassword } = userData;
      return new HttpResponse({ status: 201, body: userWithoutPassword });
    } catch (err) {
      console.error('Failed to create user:', err);
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to create user' },
      });
    }
  }

  private async handleUpdateUser(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
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
        return new HttpResponse({ status: 404, body: { error: 'User not found' } });
      }

      // Return without password
      const { password, ...userWithoutPassword } = updatedUser;
      return new HttpResponse({ status: 200, body: userWithoutPassword });
    } catch (err) {
      console.error('Failed to update user:', err);
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to update user' },
      });
    }
  }

  private async handleDeleteUser(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await randomDelay();
    try {
      const id = req.url.split('/').pop()!;
      await this.userRepo.delete(id);
      return new HttpResponse({ status: 204, body: null });
    } catch (err) {
      console.error('Failed to delete user:', err);
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to delete user' },
      });
    }
  }

  // Order handlers
  private async handleGetOrders(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const orders = await this.orderRepo.getAll();
      return new HttpResponse({ status: 200, body: { orders } });
    } catch (err) {
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to fetch orders' },
      });
    }
  }

  private async handleCreateOrder(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const order = req.body as Order;
      await this.orderRepo.create(order);
      return new HttpResponse({ status: 201, body: { order } });
    } catch (err) {
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to create order' },
      });
    }
  }

  private async handleGetOrder(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const id = req.url.split('/').pop()!;
      const order = await this.orderRepo.getById(id);

      if (!order) {
        return new HttpResponse({ status: 404, body: { error: 'Order not found' } });
      }

      return new HttpResponse({ status: 200, body: { order } });
    } catch (err) {
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to fetch order' },
      });
    }
  }

  // Cart handlers
  private async handleGetCart(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/users\/([\w-]+)\/cart/)?.[1];
      if (!userId) {
        return new HttpResponse({ status: 400, body: { error: 'Invalid user ID' } });
      }

      const cart = await this.cartRepo.getByUserId(userId);

      return new HttpResponse({
        status: 200,
        body: cart || { userId, items: [], updatedAt: Date.now() },
      });
    } catch (err) {
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to fetch cart' },
      });
    }
  }

  private async handleUpdateCart(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/users\/([\w-]+)\/cart/)?.[1];
      if (!userId) {
        return new HttpResponse({ status: 400, body: { error: 'Invalid user ID' } });
      }

      const { items, updatedAt } = req.body as { items: Cart['items']; updatedAt: number };
      const existingCart = await this.cartRepo.getByUserId(userId);

      if (existingCart) {
        // Update existing cart
        await this.cartRepo.update(userId, {
          userId,
          items,
          updatedAt,
        });
      } else {
        // Create new cart
        await this.cartRepo.create({
          userId,
          items,
          updatedAt,
        });
      }

      const updatedCart = await this.cartRepo.getByUserId(userId);
      return new HttpResponse({ status: 200, body: updatedCart });
    } catch (err) {
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to update cart' },
      });
    }
  }

  private async handleAddCartItem(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/users\/([\w-]+)\/cart/)?.[1];
      const { productId, quantity } = req.body as { productId: string; quantity: number };

      if (!userId) {
        return new HttpResponse({ status: 400, body: { error: 'Invalid user ID' } });
      }

      await this.cartRepo.addItem(userId, productId, quantity);
      const cart = await this.cartRepo.getByUserId(userId);

      return new HttpResponse({ status: 200, body: { cart } });
    } catch (err) {
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to add item to cart' },
      });
    }
  }

  private async handleRemoveCartItem(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/users\/([\w-]+)\/cart/)?.[1];
      const productId = req.url.split('/').pop();

      if (!userId || !productId) {
        return new HttpResponse({ status: 400, body: { error: 'Invalid parameters' } });
      }

      await this.cartRepo.removeItem(userId, productId);
      const cart = await this.cartRepo.getByUserId(userId);

      return new HttpResponse({ status: 200, body: { cart } });
    } catch (err) {
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to remove item from cart' },
      });
    }
  }
}
