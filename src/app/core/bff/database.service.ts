import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private readonly DB_NAME = 'OrdersDB';
  private readonly DB_VERSION = 1;
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
    console.log('🗄️ DatabaseService.initialize() called');
    
    // Skip initialization on server
    if (!this.isBrowser) {
      console.log('DatabaseService: Skipping initialization (SSR)');
      return Promise.resolve();
    }

    // Return existing promise if already initializing
    if (this.initPromise) {
      console.log('⏳ DatabaseService: Already initializing, waiting...');
      return this.initPromise;
    }

    // Already initialized
    if (this.db) {
      console.log('✅ DatabaseService: Already initialized');
      return Promise.resolve();
    }

    console.log(`🔧 Opening IndexedDB: ${this.DB_NAME} v${this.DB_VERSION}`);

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('❌ Database failed to open:', request.error);
        this.initPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('✅ Database opened successfully (onsuccess event)');
        this.db = request.result;
        this.initPromise = null;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        console.log('🔄 Database upgrade needed');
        const db = (event.target as IDBOpenDBRequest).result;

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
          console.log('Users store created');
        }

        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('categoryId', 'categoryId');
          console.log('Products store created');
        }

        // Orders store
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
          ordersStore.createIndex('userId', 'userId');
          ordersStore.createIndex('status', 'status');
          console.log('Orders store created');
        }

        // Order items store
        if (!db.objectStoreNames.contains('order_items')) {
          const orderItemsStore = db.createObjectStore('order_items', {
            keyPath: 'id',
          });
          orderItemsStore.createIndex('orderId', 'orderId');
          console.log('Order items store created');
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
          console.log('Categories store created');
        }

        // Cart store (one per user)
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'userId' });
          console.log('Cart store created');
        }

        // Permissions store
        if (!db.objectStoreNames.contains('permissions')) {
          const permissionsStore = db.createObjectStore('permissions', {
            keyPath: 'id',
          });
          permissionsStore.createIndex('role', 'role');
          console.log('Permissions store created');
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
    if (!this.isBrowser || !this.db) {
      console.warn(`⚠️ write: Not in browser or DB not initialized`);
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = mode === 'add' ? store.add(data) : store.put(data);

      request.onerror = () => {
        console.error(`❌ write error in ${storeName} (${mode}):`, request.error);
        reject(request.error);
      };
      request.onsuccess = () => resolve();
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
    value: IDBValidKey,
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
        console.log(`Available indexes:`, Array.from(store.indexNames));
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
