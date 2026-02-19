import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import compression from 'compression';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Enable gzip/brotli compression for all responses
 * This reduces payload size significantly (Est. savings: ~70%)
 */
app.use(
  compression({
    level: 6, // Balance between compression ratio and CPU usage
    threshold: 1024, // Only compress responses larger than 1KB
  })
);

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 * Optimized caching for better performance scores
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y', // Cache static assets for 1 year
    index: false,
    redirect: false,
    etag: true, // Enable ETags for cache validation
    lastModified: true,
    setHeaders: (res, path) => {
      // More aggressive caching for versioned assets (with hashes)
      if (path.match(/\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }

      // SEO files should not be cached aggressively
      if (path.match(/\/(robots\.txt|sitemap\.xml)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.setHeader('Content-Type', path.endsWith('.xml') ? 'application/xml' : 'text/plain');
      }
    },
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    // eslint-disable-next-line no-console
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
