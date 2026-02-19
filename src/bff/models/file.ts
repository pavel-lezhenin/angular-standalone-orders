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
