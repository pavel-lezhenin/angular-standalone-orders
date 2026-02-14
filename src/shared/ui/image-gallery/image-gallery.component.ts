import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Image item with preview URL
 */
export interface ImageItem {
  fileId: string;
  url: string;
  filename: string;
}

/**
 * Image Gallery Component
 * 
 * Features:
 * - Drag & drop file upload
 * - Click to upload
 * - Image preview with thumbnails (100x100px)
 * - Delete images
 * - Set primary image (via star button)
 * - Reorder images (drag to reorder)
 * - Borders for transparent images visibility
 * - Maximum file size validation
 * - Image format validation (jpg, png, webp)
 * 
 * Emits:
 * - fileUpload: when user selects file for upload
 * - fileDelete: when user deletes image
 * - setPrimary: when user sets image as primary (first position)
 * - orderChange: when user reorders images via drag-and-drop
 */
@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGalleryComponent {
  readonly images = input<ImageItem[]>([]);
  readonly maxImages = input<number>(10);
  readonly maxFileSize = input<number>(5 * 1024 * 1024); // 5MB default
  readonly isUploading = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly fileUpload = output<File>();
  readonly fileDelete = output<string>(); // fileId
  readonly orderChange = output<string[]>(); // array of fileIds in new order
  readonly setPrimary = output<string>(); // fileId to make primary

  protected readonly isDragging = signal(false);
  protected readonly draggedIndex = signal<number | null>(null);

  protected readonly acceptedFormats = '.jpg,.jpeg,.png,.webp';

  /**
   * Handle file selection from input
   */
  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]!);
      input.value = ''; // Reset input
    }
  }

  /**
   * Handle drag over
   */
  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled()) {
      this.isDragging.set(true);
    }
  }

  /**
   * Handle drag leave
   */
  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  /**
   * Handle file drop
   */
  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (this.disabled()) {
      return;
    }

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]!);
    }
  }

  /**
   * Process and validate file
   */
  private processFile(file: File): void {
    // Check max images limit
    if (this.images().length >= this.maxImages()) {
      alert(`Maximum ${this.maxImages()} images allowed`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize()) {
      const maxMB = (this.maxFileSize() / (1024 * 1024)).toFixed(1);
      alert(`File size must be less than ${maxMB}MB`);
      return;
    }

    // Emit file for upload
    this.fileUpload.emit(file);
  }

  /**
   * Delete image
   */
  protected deleteImage(fileId: string, event: Event): void {
    event.stopPropagation();
    this.fileDelete.emit(fileId);
  }

  /**
   * Set image as primary (move to first position)
   */
  protected setAsPrimary(fileId: string, event: Event): void {
    event.stopPropagation();
    this.setPrimary.emit(fileId);
  }

  /**
   * Start dragging image for reorder
   */
  protected onDragStart(index: number, event: DragEvent): void {
    this.draggedIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  /**
   * Handle drag over image for reorder
   */
  protected onDragOverImage(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  /**
   * Drop image to reorder
   */
  protected onDropImage(targetIndex: number, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const draggedIdx = this.draggedIndex();
    if (draggedIdx === null || draggedIdx === targetIndex) {
      return;
    }

    const newOrder = [...this.images()];
    const [draggedItem] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIndex, 0, draggedItem!);

    this.draggedIndex.set(null);

    // Emit new order as fileIds
    this.orderChange.emit(newOrder.map((img) => img.fileId));
  }

  /**
   * End drag
   */
  protected onDragEnd(): void {
    this.draggedIndex.set(null);
  }

  /**
   * Get readable file size
   */
  protected get maxFileSizeText(): string {
    const mb = this.maxFileSize() / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  }

  /**
   * Check if can upload more
   */
  protected get canUploadMore(): boolean {
    return !this.disabled() && this.images().length < this.maxImages();
  }
}
