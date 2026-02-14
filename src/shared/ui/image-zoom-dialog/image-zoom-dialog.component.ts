import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Image zoom dialog data
 */
export interface ImageZoomDialogData {
  images: string[];
  currentIndex: number;
  productName: string;
}

/**
 * Image Zoom Dialog Component
 * 
 * Full-screen modal for viewing product images
 * Features:
 * - Navigation between images (arrows, keyboard)
 * - Close on backdrop click or ESC
 * - Smooth transitions
 */
@Component({
  selector: 'app-image-zoom-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './image-zoom-dialog.component.html',
  styleUrl: './image-zoom-dialog.component.scss',
})
export class ImageZoomDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ImageZoomDialogComponent>);
  readonly data = inject<ImageZoomDialogData>(MAT_DIALOG_DATA);

  protected currentIndex = this.data.currentIndex;

  protected get currentImage(): string {
    const image = this.data.images[this.currentIndex];
    return image ?? '';
  }

  protected get canGoPrevious(): boolean {
    return this.currentIndex > 0;
  }

  protected get canGoNext(): boolean {
    return this.currentIndex < this.data.images.length - 1;
  }

  protected previous(): void {
    if (this.canGoPrevious) {
      this.currentIndex--;
    }
  }

  protected next(): void {
    if (this.canGoNext) {
      this.currentIndex++;
    }
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
