import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

import { ProductService } from '../../admin/products/services/product.service';
import { CartService } from '@shared/services/cart.service';
import { LayoutService } from '@/shared/services/layout.service';
import { NotificationService } from '@shared/services/notification.service';
import { PageLoaderComponent } from '@shared/ui/page-loader';
import { ImageZoomDialogComponent } from '@shared/ui/image-zoom-dialog/image-zoom-dialog.component';
import { DEFAULT_PRODUCT_IMAGE } from '@shared/constants/product.constants';
import type { ProductDTO } from '@core';

/**
 * Shop Product Detail Component
 *
 * Displays full product information:
 * - Image gallery with preview (Amazon-style)
 * - Detailed description
 * - Technical specifications
 * - Price and stock status
 * - Add to cart functionality
 * - Zoomable images
 */
@Component({
  selector: 'app-shop-product-detail',
  standalone: true,
  providers: [ProductService],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    PageLoaderComponent,
  ],
  templateUrl: './shop-product-detail.component.html',
  styleUrl: './shop-product-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ShopProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly layoutService = inject(LayoutService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  protected readonly product = signal<ProductDTO | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly selectedImageIndex = signal(0);

  /**
   * Get all product images
   */
  protected get allImages(): string[] {
    const product = this.product();
    if (!product) return [];
    
    const images = product.imageUrls || [];
    if (images.length > 0) return images;
    
    if (product.imageUrl) return [product.imageUrl];
    
    return [];
  }

  /**
   * Get current selected image
   */
  protected get currentImage(): string {
    const product = this.product();
    if (!product) return DEFAULT_PRODUCT_IMAGE;
    
    const images = this.allImages;
    if (images.length === 0) {
      return DEFAULT_PRODUCT_IMAGE;
    }
    
    return images[this.selectedImageIndex()] || images[0] || DEFAULT_PRODUCT_IMAGE;
  }

  constructor() {
    afterNextRender(() => {
      const productId = this.route.snapshot.paramMap.get('id');
      if (productId) {
        void this.loadProduct(productId);
      }
    });
  }

  private async loadProduct(id: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const product = await this.productService.getProduct(id);
      this.product.set(product);
      this.layoutService.setTitle(`${product.name} - Shop`);
    } catch (error) {
      console.error('Failed to load product:', error);
      this.notificationService.error('Product not found');
      void this.router.navigate(['/shop']);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected get isOutOfStock(): boolean {
    return (this.product()?.stock ?? 0) === 0;
  }

  protected get isLowStock(): boolean {
    const stock = this.product()?.stock ?? 0;
    return stock > 0 && stock <= 10;
  }

  protected selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  protected openImageZoom(): void {
    const product = this.product();
    if (!product) return;
    
    const images = this.allImages;
    if (!images || images.length === 0) return;

    this.dialog.open(ImageZoomDialogComponent, {
      data: {
        images: images,
        currentIndex: this.selectedImageIndex(),
        productName: product.name,
      },
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'image-zoom-dialog-container',
    });
  }

  protected addToCart(): void {
    const product = this.product();
    if (!product) return;

    try {
      this.cartService.addItem({
        productId: product.id,
        quantity: 1,
        name: product.name,
        price: product.price,
      });
      this.notificationService.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      this.notificationService.error('Failed to add to cart');
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/shop']);
  }
}
