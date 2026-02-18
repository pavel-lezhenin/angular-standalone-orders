# SEO Implementation Guide

This guide explains how to implement SEO optimization in the `angular-standalone-orders` application.

## Files Added

### 1. Meta Tags in HTML Head
- [src/index.html](src/index.html)

Includes:
- ✅ Meta description tag
- ✅ Keywords meta tag
- ✅ Open Graph tags (for social sharing)
- ✅ Twitter Card tags
- ✅ Canonical URL tag
- ✅ Robots meta tag
- ✅ JSON-LD structured data (Organization + Website schema)

### 2. robots.txt
- [public/robots.txt](public/robots.txt)

Properly formatted robots.txt with:
- Allow/disallow directives
- Sitemap location
- Rate limiting for aggressive crawlers

### 3. sitemap.xml
- [public/sitemap.xml](public/sitemap.xml)

XML Sitemap with all main pages and update frequency.

### 4. SEO Service for Dynamic Meta Tags

#### SeoService
**File**: `src/core/services/seo.service.ts`

Usage in components:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '@core/services/seo.service';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
})
export class ProductPageComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    // Set page meta tags
    this.seoService.setPageMeta({
      title: 'Product Name | Shop',
      description: 'Product description for SEO',
      keywords: 'product, category, keywords',
      ogTitle: 'Product Name',
      ogDescription: 'Product description for social sharing',
      ogUrl: 'https://example.com/products/product-name',
      canonical: 'https://example.com/products/product-name',
    });

    // Set product schema for structured data
    this.seoService.setProductSchema({
      name: 'Product Name',
      description: 'Product description',
      price: 99.99,
      currency: 'USD',
      rating: 4.5,
      url: 'https://example.com/products/product-name',
    });

    // Set breadcrumbs
    this.seoService.setBreadcrumbSchema([
      { name: 'Home', url: 'https://example.com' },
      { name: 'Shop', url: 'https://example.com/shop' },
      { name: 'Product Name', url: 'https://example.com/products/product-name' },
    ]);
  }
}
```

## SEO Best Practices Implemented

### 1. Page Meta Tags ✅
- Unique title tags (50-60 characters)
- Descriptive meta descriptions (120-160 characters)
- Keywords meta tag
- Canonical URLs to prevent duplicate content

### 2. Structured Data (JSON-LD) ✅
- Organization schema
- Website schema
- Product schema (for product pages)
- Breadcrumb schema (for navigation)

### 3. Open Graph Tags ✅
- og:title, og:description, og:url, og:site_name
- For better social media sharing

### 4. Twitter Cards ✅
- twitter:card, twitter:title, twitter:description
- For better Twitter sharing

### 5. Robots.txt ✅
- Directives for crawlers
- Sitemap location
- Disallow sensitive paths

### 6. Sitemap.xml ✅
- All important pages listed
- Update frequency information
- Priority levels

## Implementation Checklist

- [ ] Update canonical URLs to your production domain
- [ ] Update sitemap.xml with all relevant pages
- [ ] Update robots.txt with your actual production domain
- [ ] Implement SeoService on all dynamic pages
- [ ] Add product schema to product detail pages
- [ ] Add breadcrumb schema to category/product pages
- [ ] Test with Google Search Console
- [ ] Validate with Schema.org validator
- [ ] Test robots.txt with Google Search Console

## Testing

### Test robots.txt
- Google Search Console: Test robots.txt validator
- Visit: https://www.robots-txt.com/

### Test Structured Data
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/

### Test Meta Tags
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug
- Twitter Card Validator: https://cards-dev.twitter.com/validator

## Configuration

Update these values in your pages:

```
- Domain: https://example.com (replace with your actual domain)
- Brand: Angular Standalone Orders
- Social media URLs: Update in JSON-LD schemas
```
