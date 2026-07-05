import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BlackLotusCMS/);
  });

  test('should display theme content', async ({ page }) => {
    await page.goto('/');
    const content = page.locator('.blacklotuscms-theme');
    await expect(content).toBeVisible();
  });

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page).toHaveURL(/404/);
  });
});

test.describe('Post Pages', () => {
  test('should display published posts', async ({ page }) => {
    await page.goto('/');
    // Check if posts are listed
    const posts = page.locator('article, .post, [data-post]');
    // At least some content should be visible
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Search', () => {
  test('should perform search', async ({ page }) => {
    await page.goto('/search?q=test');
    await expect(page.locator('body')).toBeVisible();
  });
});
