# Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented to improve the Lighthouse score for the shop page from 78 to an expected 90+.

## Implemented Optimizations

### 1. Font Loading Optimization (Est. savings: 590ms)

**Problem:** Fonts were loaded via CSS `@import`, which is render-blocking and delays First Contentful Paint (FCP).

**Solution:**
- Moved font loading from `_base.scss` to `index.html` using `<link>` tags
- Added `preconnect` hints for `fonts.googleapis.com` and `fonts.gstatic.com`
- Configured `font-display: swap` for faster text rendering
- Set Material Icons to `font-display: block` to prevent layout shift

**Files modified:**
- [src/index.html](../src/index.html) - Added preconnect and font links
- [src/styles/_base.scss](../src/styles/_base.scss) - Removed CSS @import

**Impact:**
- Faster DNS resolution and connection establishment
- Non-blocking font loading
- Immediate text rendering with fallback fonts

### 2. Render Blocking Resources (Est. savings: 420ms)

**Problem:** External resources blocked initial page render.

**Solution:**
- Implemented `preconnect` for Google Fonts CDN
- Font stylesheets load with proper resource hints
- Critical CSS inlining enabled in production build

**Files modified:**
- [src/index.html](../src/index.html) - Added preconnect tags
- [angular.json](../angular.json) - Enabled `inlineCritical: true`

### 3. JavaScript & CSS Minification (Est. savings: 1,165 KiB JS + 8 KiB CSS)

**Problem:** Development build served unminified assets.

**Solution:**
- Enabled aggressive optimization in production configuration
- Configured script minification with tree shaking
- Enabled CSS minification
- Disabled source maps in production
- Removed named chunks for smaller bundles

**Files modified:**
- [angular.json](../angular.json) - Enhanced production optimization settings

**Configuration:**
```json
{
  "optimization": {
    "scripts": true,
    "styles": {
      "minify": true,
      "inlineCritical": true
    },
    "fonts": true
  },
  "sourceMap": false,
  "extractLicenses": true,
  "namedChunks": false
}
```

### 4. Server-Side Compression (Est. savings: 70% of payload size)

**Problem:** Large network payloads (3,753 KiB) without compression.

**Solution:**
- Added `compression` middleware to Express server
- Configured gzip/Brotli compression for all responses
- Set compression threshold to 1KB (minimum size)
- Balanced compression level (6) for optimal speed/ratio

**Files modified:**
- [src/server.ts](../src/server.ts) - Added compression middleware
- [package.json](../package.json) - Added compression dependency

**Impact:**
- Typical compression ratio: 70-80% reduction
- Estimated payload: ~1,100 KiB (down from 3,753 KiB)

### 5. Enhanced Caching Strategy

**Problem:** Suboptimal cache headers for static assets.

**Solution:**
- Configured aggressive caching for versioned assets (1 year)
- Added `immutable` directive for hashed files
- Enabled ETags for cache validation
- Set specific cache headers for different asset types

**Files modified:**
- [src/server.ts](../src/server.ts) - Enhanced static file serving

**Configuration:**
```typescript
setHeaders: (res, path) => {
  if (path.match(/\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}
```

### 6. Lazy Loading (Already Implemented)

**Status:** ✅ Already optimized

The shop page is already lazy-loaded via Angular route configuration:

```typescript
{
  path: 'shop',
  loadComponent: () => import('../areas/shop/shop.component').then(m => m.default),
  title: 'Shop - Orders Platform',
}
```

This ensures the shop bundle is only downloaded when needed.

## Build & Deployment

### Production Build

```bash
cd packages/angular-standalone-orders
pnpm build
```

### Production Server

```bash
pnpm serve:ssr
```

### Testing Performance

1. Build for production: `pnpm build`
2. Serve with SSR: `pnpm serve:ssr`
3. Run Lighthouse on `http://localhost:4000/shop`

**Note:** Always test in production mode, as development builds are intentionally unoptimized.

## Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Performance Score | 78 | 90+ | +12 points |
| Font Display | -590ms | 0 | 590ms saved |
| Render Blocking | -420ms | 0 | 420ms saved |
| JavaScript Size | 1,165 KiB | ~300 KiB | ~865 KiB saved |
| CSS Size | 8 KiB | ~2 KiB | ~6 KiB saved |
| Network Payload | 3,753 KiB | ~1,100 KiB | ~2,650 KiB saved |
| Unused JavaScript | 1,722 KiB | ~400 KiB | ~1,320 KiB saved |

## Additional Recommendations

### 1. Image Optimization (Future)

When product images are added:
- Use WebP format with JPEG fallback
- Implement lazy loading for images below the fold
- Use responsive images with `srcset`
- Consider image CDN (e.g., Cloudflare Images, Cloudinary)

### 2. Service Worker & Cache API (Future)

For offline support and even better performance:
- Implement Angular Service Worker
- Cache API responses with appropriate strategies
- Precache critical assets

### 3. Content Delivery Network (Production)

For production deployment:
- Serve static assets via CDN (CloudFront, Cloudflare, etc.)
- Enable HTTP/2 or HTTP/3
- Use edge caching for SSR pages

### 4. Bundle Analysis

Monitor bundle sizes regularly:
```bash
pnpm build --stats-json
npx webpack-bundle-analyzer dist/angular-standalone-orders/browser/stats.json
```

### 5. Performance Budget

The current budget is:
- Initial bundle: max 1MB (warning at 500KB)
- Component styles: max 8KB (warning at 4KB)

Consider tightening these limits as optimizations progress.

## Monitoring

### Runtime Performance

Use Chrome DevTools Performance panel to monitor:
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)

### Bundle Size

Monitor bundle sizes after each build:
```bash
pnpm build
ls -lh dist/angular-standalone-orders/browser
```

### Lighthouse CI

Consider integrating Lighthouse CI in the pipeline:
```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: http://localhost:4000/shop
    budgetPath: ./lighthouse-budget.json
```

## Troubleshooting

### High Bundle Size

1. Check for accidental imports of entire libraries
2. Verify tree shaking is working correctly
3. Audit dependencies for bloat: `npx bundlephobia [package-name]`

### Slow Server Response

1. Enable server-side caching for BFF endpoints
2. Optimize database queries
3. Consider using Redis for session/cache storage

### Poor LCP Score

1. Ensure critical images are preloaded
2. Optimize largest image on page
3. Check server response time
4. Verify CSS doesn't delay rendering

## References

- [Angular Performance Guide](https://angular.dev/best-practices/runtime-performance)
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/overview/)
- [Core Web Vitals](https://web.dev/vitals/)
