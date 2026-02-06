import { test, expect } from '@playwright/test';

test.describe('App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('should load home page with welcome message', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome to Orders Management');
  });

  test('should have navigation links', async ({ page }) => {
    const ordersLink = page.locator('a[routerLink="/orders"]');
    const authLink = page.locator('a[routerLink="/auth"]');

    await expect(ordersLink).toBeVisible();
    await expect(authLink).toBeVisible();
  });

  test('should navigate to orders page', async ({ page }) => {
    await page.click('a[routerLink="/orders"]');
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.locator('h1')).toContainText('Your Orders');
  });

  test('should display orders table', async ({ page }) => {
    await page.click('a[routerLink="/orders"]');

    const table = page.locator('.orders-table');
    await expect(table).toBeVisible();

    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display order details in table', async ({ page }) => {
    await page.click('a[routerLink="/orders"]');

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toContainText('ORD-001');
    await expect(firstRow).toContainText('99.99');
    await expect(firstRow).toContainText('delivered');
  });
});
