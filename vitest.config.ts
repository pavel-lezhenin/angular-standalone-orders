import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['e2e/**', '**/node_modules/**', '**/.git/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.routes.ts',
        'src/main.ts',
        'src/main.server.ts',
        'src/test-setup.ts',
        'src/server.ts',
        // Barrel re-export files — no executable logic
        'src/**/index.ts',
        // Pure TypeScript interface / type-alias files — compile to nothing
        'src/**/*.dto.ts',
        'src/core/types/shared-types.ts',
        'src/bff/**/*.ts',
      ],
      thresholds: {
        lines: 4,
        functions: 3,
        branches: 2,
        statements: 4,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@areas': fileURLToPath(new URL('./src/areas', import.meta.url)),
      '@bff': fileURLToPath(new URL('./src/bff', import.meta.url)),
    },
  },
});
