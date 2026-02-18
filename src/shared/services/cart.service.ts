import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import type { CartItemDTO } from '@core/models/cart.dto';
import { firstValueFrom } from 'rxjs';

const GUEST_CART_KEY = 'guest_cart';

interface CartResponse {
  userId: string;
  items: CartItemDTO[];
  updatedAt: number;
}

/**
 * Service for managing shopping cart with hybrid persistence.
 * 
 * Guest users: cart stored in localStorage
 * Authenticated users: cart stored in IndexedDB via HTTP API
 * 
 * Automatic cart migration:
 * - On login: merges guest cart into authenticated cart
 * - On logout: migrates authenticated cart to guest localStorage
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems = signal<CartItemDTO[]>([]);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private previousUserId: string | null = null;
  private restorePromise: Promise<void> = Promise.resolve();
  
  /**
   * Computed signal for total item count
   */
  itemCount = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  constructor() {
    // Restore cart on service initialization
    this.restorePromise = this.restoreCart();
    
    // Initialize previousUserId to track actual auth changes
    const initialUser = this.authService.currentUser();
    this.previousUserId = initialUser?.id ?? null;
    
    // Watch for authentication changes (login/logout)
    effect(() => {
      const user = this.authService.currentUser();
      const currentUserId = user?.id ?? null;
      
      // Skip if this is the first run (no actual change)
      if (this.previousUserId === currentUserId) {
        return;
      }
      
      if (currentUserId && !this.previousUserId) {
        // User logged in - merge guest cart to authenticated
        void this.mergeGuestCartOnLogin(currentUserId);
      } else if (!currentUserId && this.previousUserId) {
        // User logged out - migrate to guest cart
        this.migrateToGuestOnLogout();
      }
      
      // Update previous user ID
      this.previousUserId = currentUserId;
    });
  }

  /**
   * Adds item to cart or increments quantity if already exists
   */
  addItem(item: CartItemDTO): void {
    const currentItems = this.cartItems();
    const existingIndex = currentItems.findIndex(
      i => i.productId === item.productId
    );

    let updatedItems: CartItemDTO[];
    if (existingIndex >= 0) {
      // Increment quantity
      updatedItems = currentItems.map((i, idx) =>
        idx === existingIndex
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      // Add new item
      updatedItems = [...currentItems, item];
    }

    this.cartItems.set(updatedItems);
    this.persistCart();
  }

  /**
   * Removes item from cart
   */
  removeItem(productId: string): void {
    const updatedItems = this.cartItems().filter(
      item => item.productId !== productId
    );
    this.cartItems.set(updatedItems);
    this.persistCart();
  }

  /**
   * Updates item quantity
   */
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const updatedItems = this.cartItems().map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    this.cartItems.set(updatedItems);
    this.persistCart();
  }

  /**
   * Clears all items from cart
   */
  clear(): void {
    this.cartItems.set([]);
    this.persistCart();
  }

  /**
   * Gets all cart items
   */
  getItems(): CartItemDTO[] {
    return this.cartItems();
  }

  /**
   * Wait until initial cart restore is finished.
   * Required to avoid race condition on page reload for authenticated users.
   */
  async waitForRestore(): Promise<void> {
    await this.restorePromise;
  }

  /**
   * Restores cart from localStorage (guest) or IndexedDB (authenticated)
   */
  private async restoreCart(): Promise<void> {
    const user = this.authService.currentUser();
    
    if (user) {
      // Restore from IndexedDB for authenticated user
      await this.restoreAuthenticatedCart(user.id);
    } else {
      // Restore from localStorage for guest
      this.restoreGuestCart();
    }
  }

  /**
   * Restores guest cart from localStorage (browser only)
   */
  private restoreGuestCart(): void {
    if (!this.isBrowser) return;
    
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      if (stored) {
        const items = JSON.parse(stored) as CartItemDTO[];
        this.cartItems.set(items);
      }
    } catch (error) {
      console.error('Failed to restore guest cart:', error);
      localStorage.removeItem(GUEST_CART_KEY);
    }
  }

  /**
   * Restores authenticated cart from backend via HTTP
   */
  private async restoreAuthenticatedCart(userId: string): Promise<void> {
    try {
      const cart = await firstValueFrom(
        this.http.get<CartResponse>(`/api/users/${userId}/cart`)
      );
      if (cart?.items) {
        this.cartItems.set(cart.items);
      }
    } catch (error) {
      console.error('Failed to restore authenticated cart:', error);
    }
  }

  /**
   * Persists cart to appropriate storage
   */
  private persistCart(): void {
    const user = this.authService.currentUser();
    
    if (user) {
      void this.syncToIndexedDB(user.id);
    } else {
      void this.syncToLocalStorage();
    }
  }

  /**
   * Syncs cart to localStorage for guest users (browser only)
   */
  private syncToLocalStorage(): void {
    if (!this.isBrowser) return;
    
    try {
      const items = this.cartItems();
      if (items.length > 0) {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
      } else {
        localStorage.removeItem(GUEST_CART_KEY);
      }
    } catch (error) {
      console.error('Failed to sync cart to localStorage:', error);
    }
  }

  /**
   * Syncs cart to backend via HTTP for authenticated users
   */
  private async syncToIndexedDB(userId: string): Promise<void> {
    try {
      const items = this.cartItems();
      
      // PUT request to update cart (creates if doesn't exist)
      await firstValueFrom(
        this.http.put<CartResponse>(`/api/users/${userId}/cart`, {
          items,
          updatedAt: Date.now(),
        })
      );
    } catch (error) {
      console.error('Failed to sync cart to backend:', error);
    }
  }

  /**
   * Merges guest cart into authenticated cart on login
   */
  private async mergeGuestCartOnLogin(userId: string): Promise<void> {
    if (!this.isBrowser) {
      await this.restoreAuthenticatedCart(userId);
      return;
    }
    
    try {
      // Get guest cart from localStorage
      const guestCartRaw = localStorage.getItem(GUEST_CART_KEY);
      if (!guestCartRaw) {
        // No guest cart, just load authenticated cart
        await this.restoreAuthenticatedCart(userId);
        return;
      }

      const guestItems = JSON.parse(guestCartRaw) as CartItemDTO[];
      
      // Get authenticated cart from backend via HTTP
      let authItems: CartItemDTO[] = [];
      try {
        const authCart = await firstValueFrom(
          this.http.get<CartResponse>(`/api/users/${userId}/cart`)
        );
        authItems = authCart?.items || [];
      } catch {
        // Cart doesn't exist yet, that's fine
        authItems = [];
      }

      // Merge: combine quantities for duplicate products
      const mergedMap = new Map<string, CartItemDTO>();
      
      // Add authenticated items first
      authItems.forEach(item => {
        mergedMap.set(item.productId, { ...item });
      });

      // Merge guest items
      guestItems.forEach(guestItem => {
        const existing = mergedMap.get(guestItem.productId);
        if (existing) {
          existing.quantity += guestItem.quantity;
        } else {
          mergedMap.set(guestItem.productId, { ...guestItem });
        }
      });

      const mergedItems = Array.from(mergedMap.values());
      
      // Update signal
      this.cartItems.set(mergedItems);
      
      // Persist to IndexedDB
      await this.syncToIndexedDB(userId);
      
      // Clear guest cart from localStorage
      if (this.isBrowser) {
        localStorage.removeItem(GUEST_CART_KEY);
      }
    } catch (error) {
      console.error('Failed to merge guest cart on login:', error);
    }
  }

  /**
   * Migrates authenticated cart to guest cart on logout
   */
  private migrateToGuestOnLogout(): void {
    if (!this.isBrowser) return;
    
    try {
      const currentItems = this.cartItems();
      
      // Save current items to localStorage for guest use
      if (currentItems.length > 0) {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(currentItems));
      }
      
      // Note: IndexedDB cart will be cleared by logout handler if needed
      // We keep the signal state so user doesn't lose cart items visually
    } catch (error) {
      console.error('Failed to migrate cart on logout:', error);
    }
  }
}
