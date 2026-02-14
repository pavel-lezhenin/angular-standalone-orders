import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { StoredFile } from '../models/file';
import { BaseRepository } from './base.repository';

/**
 * File Repository
 * Manages file storage in IndexedDB (S3 emulation)
 */
@Injectable({
  providedIn: 'root',
})
export class FileRepository extends BaseRepository<StoredFile> {
  storeName = 'files';

  constructor(db: DatabaseService) {
    super(db);
  }

  /**
   * Get file blob URL for display
   * Creates object URL from stored blob
   */
  async getFileUrl(fileId: string): Promise<string | null> {
    console.log('🔍 FileRepository: Getting file URL for:', fileId);
    
    const file = await this.getById(fileId);
    if (!file) {
      console.warn('⚠️ FileRepository: File not found:', fileId);
      return null;
    }
    
    console.log('✅ FileRepository: File found, creating object URL');
    
    // Create object URL from blob
    const url = URL.createObjectURL(file.blob);
    console.log('🔗 FileRepository: Object URL created:', url);
    
    return url;
  }

  /**
   * Get multiple file URLs
   */
  async getFileUrls(fileIds: string[]): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>();
    
    for (const id of fileIds) {
      const url = await this.getFileUrl(id);
      if (url) {
        urlMap.set(id, url);
      }
    }
    
    return urlMap;
  }

  /**
   * Get files by uploader
   */
  async getByUploader(userId: string): Promise<StoredFile[]> {
    return this.getByIndex('uploadedBy', userId);
  }
}
