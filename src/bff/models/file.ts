/**
 * File entity for file storage (S3 emulation)
 * Stores actual file blobs with metadata in IndexedDB
 */
export interface StoredFile {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  blob: Blob;
  uploadedAt: number;
  uploadedBy?: string; // User ID who uploaded
}

/**
 * File metadata (without blob)
 * Used for DTOs and listings
 */
export interface FileMetadata {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: number;
  uploadedBy?: string;
}

/**
 * Upload result with file ID and preview URL
 */
export interface UploadResult {
  fileId: string;
  url: string;
  metadata: FileMetadata;
}
