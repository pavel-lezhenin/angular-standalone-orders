import { test, expect } from '@playwright/test';

test.describe('Playwright Config', () => {
  test('should have baseURL configured', async ({ page }) => {
    // This test verifies that playwright.config.ts has proper baseURL
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });
});
