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
    try {
      const categories = await this.categoryRepo.getAll();
      return new HttpResponse({ status: 200, body: { categories } });
    } catch (err) {
      return new HttpResponse({
        status: 500,
        body: { error: 'Failed to fetch categories' },
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
