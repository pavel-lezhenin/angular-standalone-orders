export interface FileMetadataDTO {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: number;
  uploadedBy?: string;
}

export interface UploadResultDTO {
  fileId: string;
  url: string;
  metadata: FileMetadataDTO;
}
