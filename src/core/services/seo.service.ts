import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface PageMetaTags {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  canonical?: string;
}

/**
 * Service for managing meta tags and SEO optimization
 * Provides methods to update page meta tags dynamically
 */
@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly metaService = inject(Meta);
  private readonly titleService = inject(Title);

  /**
   * Update page meta tags for SEO
   * @param tags Page meta tag configuration
   */
  setPageMeta(tags: PageMetaTags): void {
    // Set title
    this.titleService.setTitle(tags.title);

    // Set/update meta description
    this.metaService.updateTag({ name: 'description', content: tags.description });

    // Set/update keywords if provided
    if (tags.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: tags.keywords });
    }

    // Set Open Graph tags if provided
    if (tags.ogTitle) {
      this.metaService.updateTag({ property: 'og:title', content: tags.ogTitle });
    }

    if (tags.ogDescription) {
      this.metaService.updateTag({
        property: 'og:description',
        content: tags.ogDescription,
      });
    }

    if (tags.ogUrl) {
      this.metaService.updateTag({ property: 'og:url', content: tags.ogUrl });
    }

    // Set canonical URL if provided
    if (tags.canonical) {
      this.metaService.updateTag({ rel: 'canonical', href: tags.canonical });
    }
  }

  /**
   * Reset to default meta tags
   */
  resetPageMeta(): void {
    this.titleService.setTitle('Angular Standalone Orders');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Discover our curated collection of products. Browse, compare, and order with ease using our modern shopping platform.',
    });
  }

  /**
   * Set breadcrumb navigation schema
   * @param breadcrumbs Array of breadcrumb items
   */
  setBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.textContent = JSON.stringify(schema);
    document.head.appendChild(scriptTag);
  }

  /**
   * Set product schema for e-commerce pages
   * @param product Product object
   */
  setProductSchema(product: {
    name: string;
    description: string;
    price: number;
    currency: string;
    rating?: number;
    url: string;
  }): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: 'https://schema.org/InStock',
      },
      url: product.url,
      ...(product.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          ratingCount: 1,
        },
      }),
    };

    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.textContent = JSON.stringify(schema);
    document.head.appendChild(scriptTag);
  }
}
