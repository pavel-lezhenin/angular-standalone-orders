import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { HttpRequest, HttpResponse } from '@angular/common/http';
import { DatabaseService } from './database.service';
import { UserRepository } from './repositories/user.repository';
import { ProductRepository } from './repositories/product.repository';
import { OrderRepository } from './repositories/order.repository';
import { AddressRepository } from './repositories/address.repository';
import { SeedService } from './services/seed.service';
import { AuthHandlerService } from './handlers/auth-handler.service';
import { ProductHandlerService } from './handlers/product-handler.service';
import { CategoryHandlerService } from './handlers/category-handler.service';
import { UserHandlerService } from './handlers/user-handler.service';
import { OrderHandlerService } from './handlers/order-handler.service';
import { CartHandlerService } from './handlers/cart-handler.service';
import { AddressHandlerService } from './handlers/address-handler.service';
import { PaymentMethodHandlerService } from './handlers/payment-method-handler.service';
import { NotFoundResponse, UnauthorizedResponse } from './handlers/http-responses';
import type { Order } from './models';
import type { OrderStatus, PaymentStatus, UserRole } from '@core/types';

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

  private readonly db = inject(DatabaseService);
  private readonly userRepo = inject(UserRepository);
  private readonly productRepo = inject(ProductRepository);
  private readonly orderRepo = inject(OrderRepository);
  private readonly addressRepo = inject(AddressRepository);
  private readonly seedService = inject(SeedService);
  private readonly authHandler = inject(AuthHandlerService);
  private readonly productHandler = inject(ProductHandlerService);
  private readonly categoryHandler = inject(CategoryHandlerService);
  private readonly userHandler = inject(UserHandlerService);
  private readonly orderHandler = inject(OrderHandlerService);
  private readonly cartHandler = inject(CartHandlerService);
  private readonly addressHandler = inject(AddressHandlerService);
  private readonly paymentMethodHandler = inject(PaymentMethodHandlerService);

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
    const addressCount = await this.addressRepo.count();
    if (productCount < 40 || addressCount === 0) {
      await this.seedService.seedAll();
    }

    await this.migrateLegacyOrders();

    this.initialized = true;
  }

  private async migrateLegacyOrders(): Promise<void> {
    const oldStatusMap: Readonly<Record<string, OrderStatus>> = {
      queue: 'pending_payment',
      processing: 'warehouse',
      completed: 'delivered',
      canceled: 'cancelled',
    };

    const now = Date.now();
    const orders = await this.orderRepo.getAll();

    for (const order of orders) {
      const currentOrder = order as Order & { status: string; paymentStatus?: string };
      const rawStatus = String(currentOrder.status);

      let normalizedStatus: OrderStatus = (oldStatusMap[rawStatus] ?? rawStatus) as OrderStatus;
      let normalizedPaymentStatus: PaymentStatus = (
        currentOrder.paymentStatus as PaymentStatus | undefined
      ) ?? (normalizedStatus === 'pending_payment' ? 'pending' : 'approved');

      if (normalizedStatus === 'pending_payment' && normalizedPaymentStatus === 'approved') {
        normalizedStatus = 'paid';
      }

      if (
        normalizedPaymentStatus === 'pending'
        && normalizedStatus !== 'pending_payment'
        && normalizedStatus !== 'cancelled'
      ) {
        normalizedPaymentStatus = 'approved';
      }

      const statusChanged = normalizedStatus !== rawStatus;
      const paymentChanged = normalizedPaymentStatus !== currentOrder.paymentStatus;
      const hasArrayFixes = !Array.isArray(order.statusHistory) || !Array.isArray(order.comments);

      if (!statusChanged && !paymentChanged && !hasArrayFixes) {
        continue;
      }

      const statusHistory = [...(order.statusHistory ?? [])];
      if (statusChanged) {
        const hasMigrationTransition = statusHistory.some(
          entry =>
            entry.actor.id === 'system-migration'
            && entry.fromStatus === rawStatus
            && entry.toStatus === normalizedStatus
        );

        if (!hasMigrationTransition) {
          statusHistory.push({
            fromStatus: rawStatus as OrderStatus,
            toStatus: normalizedStatus,
            changedAt: now,
            actor: {
              id: 'system-migration',
              role: 'admin',
              email: 'migration@local',
            },
          });
        }
      }

      const comments = [...(order.comments ?? [])];
      const migrationCommentText = 'Legacy migration applied: order status/payment normalized';
      const hasMigrationComment = comments.some(comment => comment.text === migrationCommentText);

      if (!hasMigrationComment && (statusChanged || paymentChanged)) {
        comments.push({
          id: `migration-${order.id}`,
          text: migrationCommentText,
          createdAt: now,
          actor: {
            id: 'system-migration',
            role: 'admin',
            email: 'migration@local',
          },
          isSystem: true,
        });
      }

      await this.orderRepo.updateFull({
        ...order,
        status: normalizedStatus,
        paymentStatus: normalizedPaymentStatus,
        statusHistory,
        comments,
        updatedAt: now,
      });
    }
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

    const scopedUserId = this.extractScopedUserId(req.url);
    if (scopedUserId) {
      const authError = await this.ensureUserAccess(scopedUserId);
      if (authError) {
        return authError;
      }
    }

    if (this.isPrivilegedEndpoint(req)) {
      const authError = await this.ensurePrivilegedAccess();
      if (authError) {
        return authError;
      }
    }

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
    if (req.method === 'POST' && req.url.endsWith('/api/products/batch')) {
      return this.productHandler.handleGetProductsByIds(req);
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
    if (req.method === 'PATCH' && req.url.match(/\/api\/orders\/[\w-]+\/status$/)) {
      return this.orderHandler.handleUpdateOrderStatus(req);
    }
    if (req.method === 'POST' && req.url.match(/\/api\/orders\/[\w-]+\/comments$/)) {
      return this.orderHandler.handleAddOrderComment(req);
    }

    if (req.method === 'GET' && req.url.match(/\/api\/users\/[\w-]+\/orders$/)) {
      return this.orderHandler.handleGetUserOrders(req);
    }

    // User endpoints
    if (req.method === 'GET' && req.url.includes('/api/users/check-email')) {
      return this.userHandler.handleCheckEmail(req);
    }
    if (
      req.method === 'GET' &&
      req.url.includes('/api/users') &&
      !req.url.includes('/cart') &&
      !req.url.includes('/orders') &&
      !req.url.includes('/addresses') &&
      !req.url.includes('/payment-methods')
    ) {
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

    // Address endpoints
    if (req.method === 'GET' && req.url.match(/\/api\/users\/[\w-]+\/addresses$/)) {
      return this.addressHandler.handleGetAddresses(req);
    }
    if (req.method === 'POST' && req.url.match(/\/api\/users\/[\w-]+\/addresses$/)) {
      return this.addressHandler.handleCreateAddress(req);
    }
    if (req.method === 'PATCH' && req.url.match(/\/api\/users\/[\w-]+\/addresses\/[\w-]+$/)) {
      return this.addressHandler.handleUpdateAddress(req);
    }
    if (req.method === 'DELETE' && req.url.match(/\/api\/users\/[\w-]+\/addresses\/[\w-]+$/)) {
      return this.addressHandler.handleDeleteAddress(req);
    }

    // Payment method endpoints
    if (req.method === 'GET' && req.url.match(/\/api\/users\/[\w-]+\/payment-methods$/)) {
      return this.paymentMethodHandler.handleGetPaymentMethods(req);
    }
    if (req.method === 'POST' && req.url.match(/\/api\/users\/[\w-]+\/payment-methods$/)) {
      return this.paymentMethodHandler.handleCreatePaymentMethod(req);
    }
    if (req.method === 'PATCH' && req.url.match(/\/api\/users\/[\w-]+\/payment-methods\/[\w-]+$/)) {
      return this.paymentMethodHandler.handleUpdatePaymentMethod(req);
    }
    if (req.method === 'DELETE' && req.url.match(/\/api\/users\/[\w-]+\/payment-methods\/[\w-]+$/)) {
      return this.paymentMethodHandler.handleDeletePaymentMethod(req);
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

  private extractScopedUserId(url: string): string | null {
    const match = url.match(/\/api\/users\/([\w-]+)(?:\/|$)/);
    if (!match) {
      return null;
    }

    const userId = match[1];
    if (!userId || userId === 'check-email') {
      return null;
    }

    return userId;
  }

  private isPrivilegedEndpoint(req: HttpRequest<unknown>): boolean {
    const isUsersList =
      req.method === 'GET'
      && req.url.endsWith('/api/users');
    const isOrdersList =
      req.method === 'GET'
      && req.url.endsWith('/api/orders');
    const isOrderStatusUpdate =
      req.method === 'PATCH'
      && req.url.match(/\/api\/orders\/[\w-]+\/status$/) !== null;
    const isOrderComment =
      req.method === 'POST'
      && req.url.match(/\/api\/orders\/[\w-]+\/comments$/) !== null;

    return isUsersList || isOrdersList || isOrderStatusUpdate || isOrderComment;
  }

  private async ensureUserAccess(targetUserId: string): Promise<HttpResponse<unknown> | null> {
    const currentUser = await this.getCurrentSessionUser();
    if (!currentUser) {
      return new UnauthorizedResponse('Authentication required');
    }

    if (currentUser.id === targetUserId || this.isPrivilegedRole(currentUser.role)) {
      return null;
    }

    return new UnauthorizedResponse('Access denied');
  }

  private async ensurePrivilegedAccess(): Promise<HttpResponse<unknown> | null> {
    const currentUser = await this.getCurrentSessionUser();
    if (!currentUser) {
      return new UnauthorizedResponse('Authentication required');
    }

    if (this.isPrivilegedRole(currentUser.role)) {
      return null;
    }

    return new UnauthorizedResponse('Admin or manager access required');
  }

  private async getCurrentSessionUser(): Promise<{ id: string; role: UserRole } | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      return null;
    }

    const user = await this.userRepo.getById(userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      role: user.role,
    };
  }

  private isPrivilegedRole(role: UserRole): boolean {
    return role === 'admin' || role === 'manager';
  }
}
