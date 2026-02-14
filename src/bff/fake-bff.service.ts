import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { DatabaseService } from './database.service';
import { UserRepository } from './repositories/user.repository';
import { ProductRepository } from './repositories/product.repository';
import { SeedService } from './services/seed.service';
import { AuthHandlerService } from './handlers/auth-handler.service';
import { ProductHandlerService } from './handlers/product-handler.service';
import { CategoryHandlerService } from './handlers/category-handler.service';
import { UserHandlerService } from './handlers/user-handler.service';
import { OrderHandlerService } from './handlers/order-handler.service';
import { CartHandlerService } from './handlers/cart-handler.service';
import { NotFoundResponse } from './handlers/http-responses';

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
    private seedService: SeedService,
    private authHandler: AuthHandlerService,
    private productHandler: ProductHandlerService,
    private categoryHandler: CategoryHandlerService,
    private userHandler: UserHandlerService,
    private orderHandler: OrderHandlerService,
    private cartHandler: CartHandlerService,
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Skip initialization on server
    if (!isPlatformBrowser(this.platformId)) {
      this.initialized = true;
      return;
    }

    // Initialize database first
    await this.db.initialize();
    
    // Always reseed in development to ensure latest data
    // Check if data exists, if not or if incomplete - reseed
    const productCount = await this.productRepo.count();
    if (productCount < 40) {
      console.log(`⚠️  Found ${productCount} products, expected 40. Reseeding...`);
      await this.seedService.seedAll();
    }

    this.initialized = true;
  }

  /**
   * Check if BFF has been initialized
   * Used by app startup to ensure BFF is ready before other operations
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Main handler for intercepted API requests
   * Routes to appropriate handler based on URL and method
   */
  async handleRequest(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    await this.initialize();

    // Auth endpoints
    if (req.method === 'POST' && req.url.endsWith('/api/auth/login')) {
      return this.authHandler.handleLogin(req);
    }
    if (req.method === 'POST' && req.url.endsWith('/api/auth/logout')) {
      return this.authHandler.handleLogout(req);
    }
    if (req.method === 'GET' && req.url.endsWith('/api/auth/me')) {
      return this.authHandler.handleGetMe(req);
    }

    // Product endpoints
    if (req.method === 'GET' && req.url.endsWith('/api/products')) {
      return this.productHandler.handleGetProducts(req);
    }
    if (req.method === 'GET' && req.url.match(/\/api\/products\/[\w-]+$/)) {
      return this.productHandler.handleGetProduct(req);
    }
    if (req.method === 'POST' && req.url.endsWith('/api/products')) {
      return this.productHandler.handleCreateProduct(req);
    }
    if (req.method === 'PUT' && req.url.match(/\/api\/products\/[\w-]+$/)) {
      return this.productHandler.handleUpdateProduct(req);
    }
    if (req.method === 'DELETE' && req.url.match(/\/api\/products\/[\w-]+$/)) {
      return this.productHandler.handleDeleteProduct(req);
    }

    // Category endpoints
    if (req.method === 'GET' && req.url.endsWith('/api/categories')) {
      return this.categoryHandler.handleGetCategories(req);
    }
    if (req.method === 'POST' && req.url.endsWith('/api/categories')) {
      return this.categoryHandler.handleCreateCategory(req);
    }
    if (req.method === 'PUT' && req.url.match(/\/api\/categories\/[\w-]+$/)) {
      return this.categoryHandler.handleUpdateCategory(req);
    }
    if (req.method === 'DELETE' && req.url.match(/\/api\/categories\/[\w-]+$/)) {
      return this.categoryHandler.handleDeleteCategory(req);
    }

    // Order endpoints
    if (req.method === 'GET' && req.url.endsWith('/api/orders')) {
      return this.orderHandler.handleGetOrders(req);
    }
    if (req.method === 'POST' && req.url.endsWith('/api/orders')) {
      return this.orderHandler.handleCreateOrder(req);
    }
    if (req.method === 'GET' && req.url.match(/\/api\/orders\/[\w-]+$/)) {
      return this.orderHandler.handleGetOrder(req);
    }

    // User endpoints
    if (req.method === 'GET' && req.url.includes('/api/users') && !req.url.includes('/cart')) {
      const userIdMatch = req.url.match(/\/api\/users\/([\w-]+)$/);
      if (userIdMatch) {
        return this.userHandler.handleGetUser(req);
      }
      return this.userHandler.handleGetUsers(req);
    }
    if (req.method === 'POST' && req.url.endsWith('/api/users')) {
      return this.userHandler.handleCreateUser(req);
    }
    if (req.method === 'PUT' && req.url.match(/\/api\/users\/[\w-]+$/) && !req.url.includes('/cart')) {
      return this.userHandler.handleUpdateUser(req);
    }
    if (req.method === 'DELETE' && req.url.match(/\/api\/users\/[\w-]+$/) && !req.url.includes('/cart')) {
      return this.userHandler.handleDeleteUser(req);
    }

    // Cart endpoints
    if (req.method === 'GET' && req.url.match(/\/api\/users\/[\w-]+\/cart$/)) {
      return this.cartHandler.handleGetCart(req);
    }
    if (req.method === 'PUT' && req.url.match(/\/api\/users\/[\w-]+\/cart$/)) {
      return this.cartHandler.handleUpdateCart(req);
    }
    if (req.method === 'POST' && req.url.match(/\/api\/users\/[\w-]+\/cart\/items$/)) {
      return this.cartHandler.handleAddCartItem(req);
    }
    if (req.method === 'DELETE' && req.url.match(/\/api\/users\/[\w-]+\/cart\/items\/[\w-]+$/)) {
      return this.cartHandler.handleRemoveCartItem(req);
    }

    return new NotFoundResponse();
  }
}
