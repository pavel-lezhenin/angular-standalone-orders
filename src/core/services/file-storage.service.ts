import { Injectable, inject } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { FileRepository } from '../../bff/repositories/file.repository';
import type { FileMetadataDTO, UploadResultDTO } from '../models';

/**
 * File Storage Service (S3 Emulation)
 * 
 * Infrastructure service providing S3-like API for file management:
 * - Upload files (returns fileId)
 * - Get file URLs (object URLs from blobs)
 * - Delete files
 * - Get metadata
 * 
 * Files are stored in IndexedDB as Blobs
 * Products reference files by ID only (imageIds: string[])
 * 
 * This is an infrastructure service, not BFF layer!
 */
@Injectable({
  providedIn: 'root',
})
export class FileStorageService {
  private readonly fileRepo = inject(FileRepository);

  /**
   * Upload file to storage
   * Returns file ID and preview URL
   */
  async uploadFile(
    file: File,
    uploadedBy?: string
  ): Promise<UploadResultDTO> {
    try {
      console.log('📤 FileStorageService: Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const fileId = uuidv4();
      const now = Date.now();

      const storedFile = {
        id: fileId,
        filename: file.name,
        mimetype: file.type,
        size: file.size,
        blob: file,
        uploadedAt: now,
        uploadedBy,
      };

      console.log('💾 FileStorageService: Saving to repository, fileId:', fileId);
      await this.fileRepo.create(storedFile);

      console.log('🔗 FileStorageService: Creating object URL');
      const url = await this.fileRepo.getFileUrl(fileId);

      if (!url) {
        throw new Error('Failed to create object URL for uploaded file');
      }

      console.log('✅ FileStorageService: Upload successful', { fileId, url });

      return {
        fileId,
        url,
        metadata: {
          id: fileId,
          filename: file.name,
          mimetype: file.type,
          size: file.size,
          uploadedAt: now,
          uploadedBy,
        },
      };
    } catch (error) {
      console.error('❌ FileStorageService: Upload failed:', error);
      throw error;
    }
  }

  /**
   * Get file URL by ID
   */
  async getFileUrl(fileId: string): Promise<string | null> {
    return this.fileRepo.getFileUrl(fileId);
  }

  /**
   * Get multiple file URLs
   */
  async getFileUrls(fileIds: string[]): Promise<Map<string, string>> {
    return this.fileRepo.getFileUrls(fileIds);
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.fileRepo.delete(fileId);
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(fileIds: string[]): Promise<void> {
    for (const id of fileIds) {
      await this.deleteFile(id);
    }
  }

  /**
   * Get file metadata (without blob)
   */
  async getFileMetadata(fileId: string): Promise<FileMetadataDTO | null> {
    const file = await this.fileRepo.getById(fileId);
    if (!file) {
      return null;
    }

    return {
      id: file.id,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: file.uploadedAt,
      uploadedBy: file.uploadedBy,
    };
  }

  /**
   * Check if file exists
   */
  async fileExists(fileId: string): Promise<boolean> {
    const file = await this.fileRepo.getById(fileId);
    return file !== null;
  }
}
