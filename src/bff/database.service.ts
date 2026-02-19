import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private readonly DB_NAME = 'OrdersDB';
  private readonly DB_VERSION = 3; // Updated for addresses and payment methods stores
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private platformId = inject(PLATFORM_ID);

  /**
   * Check if running in browser (not SSR)
   */
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Initialize IndexedDB database
   * Creates 7 object stores on first load
   */
  async initialize(): Promise<void> {
    // Skip initialization on server
    if (!this.isBrowser) {
      return Promise.resolve();
    }

    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // Already initialized
    if (this.db) {
      return Promise.resolve();
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('❌ Database failed to open:', request.error);
        this.initPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
        }

        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('categoryId', 'categoryId');
        }

        // Orders store
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
          ordersStore.createIndex('userId', 'userId');
          ordersStore.createIndex('status', 'status');
        }

        // Order items store
        if (!db.objectStoreNames.contains('order_items')) {
          const orderItemsStore = db.createObjectStore('order_items', {
            keyPath: 'id',
          });
          orderItemsStore.createIndex('orderId', 'orderId');
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        // Cart store (one per user)
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'userId' });
        }

        // Addresses store
        if (!db.objectStoreNames.contains('addresses')) {
          const addressesStore = db.createObjectStore('addresses', { keyPath: 'id' });
          addressesStore.createIndex('userId', 'userId');
          addressesStore.createIndex('isDefault', 'isDefault');
        }

        // Payment methods store
        if (!db.objectStoreNames.contains('payment_methods')) {
          const paymentMethodsStore = db.createObjectStore('payment_methods', { keyPath: 'id' });
          paymentMethodsStore.createIndex('userId', 'userId');
          paymentMethodsStore.createIndex('isDefault', 'isDefault');
        }

        // Permissions store
        if (!db.objectStoreNames.contains('permissions')) {
          const permissionsStore = db.createObjectStore('permissions', {
            keyPath: 'id',
          });
          permissionsStore.createIndex('role', 'role');
        }

        // Files store (S3 emulation)
        if (!db.objectStoreNames.contains('files')) {
          const filesStore = db.createObjectStore('files', { keyPath: 'id' });
          filesStore.createIndex('uploadedBy', 'uploadedBy');
          filesStore.createIndex('uploadedAt', 'uploadedAt');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get database instance
   */
  getDatabase(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Perform read transaction
   */
  async read<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    if (!this.isBrowser || !this.db) {
      return undefined;
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Perform write transaction
   */
  async write<T>(storeName: string, data: T, mode: 'add' | 'put' = 'put'): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }

    if (!this.db) {
      const error = new Error('Database not initialized. Call initialize() first.');
      console.error('❌ write error:', error.message);
      throw error;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = mode === 'add' ? store.add(data) : store.put(data);

      request.onerror = () => {
        console.error(`❌ write error in ${storeName} (${mode}):`, request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Perform delete transaction
   */
  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    if (!this.isBrowser || !this.db) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Query all records from store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.isBrowser || !this.db) {
      return [];
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Clear all records from store
   */
  async clear(storeName: string): Promise<void> {
    if (!this.isBrowser || !this.db) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Query records by index
   */
  async getByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> {
    if (!this.isBrowser || !this.db) {
      return [];
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get single record by index
   */
  async getOneByIndex<T>(
    storeName: string,
    indexName: string,
    value: IDBValidKey
  ): Promise<T | undefined> {
    if (!this.isBrowser || !this.db) {
      return undefined;
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      // Check if index exists
      if (!store.indexNames.contains(indexName)) {
        console.error(`❌ Index '${indexName}' does not exist in store '${storeName}'`);
        resolve(undefined);
        return;
      }

      const index = store.index(indexName);
      const request = index.get(value);

      request.onerror = () => {
        console.error(`❌ getOneByIndex error in ${storeName}.${indexName}:`, request.error);
        reject(request.error);
      };
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Count records in store
   */
  async count(storeName: string): Promise<number> {
    if (!this.isBrowser || !this.db) {
      return 0;
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}
