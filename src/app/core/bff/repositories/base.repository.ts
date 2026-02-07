import { DatabaseService } from '../database.service';

/**
 * Generic base repository with standard CRUD operations
 * Extend this class and add domain-specific methods
 */
export abstract class BaseRepository<T extends { id: string }> {
  abstract storeName: string;

  constructor(protected db: DatabaseService) {}

  async getAll(): Promise<T[]> {
    return this.db.getAll<T>(this.storeName);
  }

  async getById(id: string): Promise<T | null> {
    const record = await this.db.read<T>(this.storeName, id);
    return record ?? null;
  }

  async create(item: T): Promise<void> {
    try {
      await this.db.write(this.storeName, item, 'add');
    } catch (error: any) {
      // If item already exists, log and skip (don't throw)
      if (error.name === 'ConstraintError') {
        console.warn(`⚠️ Item with id ${item.id} already exists in ${this.storeName}, skipping`);
        return;
      }
      console.error(`❌ Failed to create item in ${this.storeName}:`, error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<T>): Promise<void> {
    const item = await this.getById(id);
    if (!item) {
      throw new Error(`${this.storeName} with id ${id} not found`);
    }
    const updated = { ...item, ...updates };
    await this.db.write(this.storeName, updated, 'put');
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(this.storeName, id);
  }

  async count(): Promise<number> {
    return this.db.count(this.storeName);
  }

  protected async getByIndex(indexName: string, value: IDBValidKey): Promise<T[]> {
    return this.db.getByIndex<T>(this.storeName, indexName, value);
  }

  protected async getOneByIndex(indexName: string, value: IDBValidKey): Promise<T | null> {
    const record = await this.db.getOneByIndex<T>(this.storeName, indexName, value);
    return record ?? null;
  }
}
