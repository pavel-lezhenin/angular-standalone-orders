import { test, expect } from '@playwright/test';

test.describe('App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('should load home page with hero title', async ({ page }) => {
    await expect(page.locator('h1.hero-title')).toContainText('Streamline Your Order Management');
  });

  test('should have top-bar navigation buttons', async ({ page }) => {
    const shopBtn = page.locator('nav.desktop-nav button', { hasText: 'Shop' });
    await expect(shopBtn).toBeVisible();
  });

  test('should navigate to shop page', async ({ page }) => {
    await page.locator('nav.desktop-nav button', { hasText: 'Shop' }).click();
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.locator('h1')).toContainText('Product Catalog');
  });

  test('should display products on shop page', async ({ page }) => {
    await page.goto('http://localhost:4200/shop');
    await expect(page.locator('h1')).toContainText('Product Catalog');
    await expect(page.locator('app-shop-product-list')).toBeVisible();
  });

  test('should show login page at /auth/login', async ({ page }) => {
    await page.goto('http://localhost:4200/auth/login');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
