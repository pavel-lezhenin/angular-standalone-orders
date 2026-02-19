import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FormGroup, FormArray, FormControl } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import type { ImageItem } from '@shared/ui/image-gallery/image-gallery.component';
import { ImageGalleryComponent } from '@shared/ui/image-gallery/image-gallery.component';
import { FormFieldComponent, type SelectOption } from '@shared/ui';
import type { CategoryDTO, ProductDTO, ProductSpecificationDTO } from '@core';
import { FileStorageService } from '@core';
// (DEFAULT_PRODUCT_IMAGE available via @shared/constants/product.constants if needed)

/**
 * Product form dialog data
 */
export interface ProductFormDialogData {
  product?: ProductDTO; // For edit mode
  categories: CategoryDTO[];
  onSave?: (formValue: ProductFormResult) => Promise<void>;
}

/**
 * Product form result
 */
export interface ProductFormResult {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  imageIds: string[];
  specifications: ProductSpecificationDTO[];
}

/**
 * Product Form Dialog
 *
 * Features:
 * - Create/Edit product
 * - Image gallery with drag & drop
 * - Dynamic specifications (add/remove)
 * - Form validation
 * - Rich text description (textarea with markdown support planned)
 *
 * Best practices for e-commerce product forms:
 * - Clear product name (required)
 * - Detailed description with formatting
 * - Multiple images with primary image (first)
 * - Technical specifications as key-value pairs
 * - Category selection
 * - Price and stock management
 */
@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ImageGalleryComponent,
    FormFieldComponent,
  ],
  templateUrl: './product-form-dialog.component.html',
  styleUrl: './product-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
  private readonly fileStorage = inject(FileStorageService);
  readonly data = inject<ProductFormDialogData>(MAT_DIALOG_DATA);

  protected readonly isEditMode = !!this.data.product;
  protected readonly categorySelectOptions: SelectOption[] = this.data.categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  protected readonly isSubmitting = signal(false);
  protected readonly isUploadingImage = signal(false);
  protected readonly images = signal<ImageItem[]>([]);

  protected readonly productForm: FormGroup;

  constructor() {
    // Initialize form
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(5000)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      specifications: this.fb.array([]),
    });
  }

  async ngOnInit(): Promise<void> {
    // Populate form in edit mode
    if (this.isEditMode && this.data.product) {
      const product = this.data.product;

      this.productForm.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        stock: product.stock,
      });

      // Load specifications
      product.specifications.forEach((spec) => {
        this.addSpecification(spec.name, spec.value);
      });

      // Load images
      await this.loadProductImages(product.imageUrls);
    }
  }

  /**
   * Load product images from URLs
   */
  private async loadProductImages(imageUrls: string[]): Promise<void> {
    // In edit mode, imageUrls are already resolved URLs
    // We need to extract fileIds from them or store them separately
    // For now, we'll create ImageItems from URLs
    // TODO: Store fileIds separately in product or parse from URLs
    const imageItems: ImageItem[] = imageUrls.map((url, index) => ({
      fileId: `existing-${index}`, // Temporary solution
      url,
      filename: `image-${index + 1}`,
    }));

    this.images.set(imageItems);
  }

  /**
   * Get specifications form array
   */
  protected get specifications(): FormArray {
    return this.productForm.get('specifications') as FormArray;
  }

  /**
   * Add specification field
   */
  protected addSpecification(name = '', value = ''): void {
    const specGroup = this.fb.group({
      name: [name, Validators.required],
      value: [value, Validators.required],
    });
    this.specifications.push(specGroup);
  }

  /**
   * Remove specification field
   */
  protected removeSpecification(index: number): void {
    this.specifications.removeAt(index);
  }

  /**
   * Handle file upload from gallery
   */
  protected async onFileUpload(file: File): Promise<void> {
    this.isUploadingImage.set(true);
    try {
      // Upload to file storage
      const result = await this.fileStorage.uploadFile(file);

      // Add to images
      const newImages = [
        ...this.images(),
        {
          fileId: result.fileId,
          url: result.url,
          filename: result.metadata.filename,
        },
      ];
      this.images.set(newImages);
    } catch (error) {
      console.error('❌ ProductFormDialog: Failed to upload image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to upload image: ${errorMessage}\n\nCheck console for details.`);
    } finally {
      this.isUploadingImage.set(false);
    }
  }

  /**
   * Handle image deletion
   */
  protected async onImageDelete(fileId: string): Promise<void> {
    // Remove from display
    const newImages = this.images().filter((img) => img.fileId !== fileId);
    this.images.set(newImages);

    // Delete from storage (only if not existing image)
    if (!fileId.startsWith('existing-')) {
      try {
        await this.fileStorage.deleteFile(fileId);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  }

  /**
   * Handle image reorder
   */
  protected onImageReorder(newOrder: string[]): void {
    const orderedImages = newOrder
      .map((fileId) => this.images().find((img) => img.fileId === fileId))
      .filter((img): img is ImageItem => img !== undefined);

    this.images.set(orderedImages);
  }

  /**
   * Set image as primary (move to first position)
   */
  protected onSetPrimary(fileId: string): void {
    const currentImages = this.images();
    const imageIndex = currentImages.findIndex((img) => img.fileId === fileId);

    if (imageIndex === -1 || imageIndex === 0) {
      return; // Already primary or not found
    }

    const newOrder = [...currentImages];
    const [image] = newOrder.splice(imageIndex, 1);
    newOrder.unshift(image!);

    this.images.set(newOrder);
  }

  /**
   * Submit form
   */
  protected async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    // Check if files are still uploading
    if (this.isUploadingImage()) {
      alert('Please wait for image upload to complete');
      return;
    }

    this.isSubmitting.set(true);
    this.dialogRef.disableClose = true;

    try {
      const formValue = this.productForm.value;
      const result: ProductFormResult = {
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        categoryId: formValue.categoryId,
        stock: formValue.stock,
        imageIds: this.images().map((img) => img.fileId),
        specifications: formValue.specifications || [],
      };

      if (this.data.onSave) {
        await this.data.onSave(result);
      }

      this.dialogRef.close(result);
    } catch (error) {
      console.error('Failed to submit form:', error);
      this.dialogRef.disableClose = false;
      this.isSubmitting.set(false);
    }
  }

  /**
   * Cancel dialog
   */
  protected onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Get dialog title
   */
  protected get dialogTitle(): string {
    return this.isEditMode ? 'Edit Product' : 'Create Product';
  }

  /**
   * Get form control as FormControl
   */
  protected getControl(name: string): FormControl {
    return this.productForm.get(name) as FormControl;
  }
}
