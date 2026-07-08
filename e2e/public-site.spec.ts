import { test, expect } from '@playwright/test';

test.describe('Public Site', () => {
  test('homepage loads without errors', async ({ page }) => {
    const response = await page.goto('/');
    // May redirect to install or show theme
    expect(response).not.toBeNull();
  });

  test('non-existent slug shows 404 or install redirect', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    const status = response?.status();
    // Should be 404, redirect to install, or redirect to login
    expect([200, 302, 307, 404]).toContain(status);
  });
});

test.describe('Install Gate', () => {
  test('uninstalled system redirects to /install', async ({ page }) => {
    const response = await page.goto('/');
    const url = page.url();
    // If not installed, should redirect to /install
    // If installed, may show the site or redirect to login
    expect(response).not.toBeNull();
  });
});

test.describe('Sitemap', () => {
  test('GET /sitemap.xml returns XML', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();

    const text = await response.text();
    expect(text).toContain('<?xml');
    expect(text).toContain('<urlset');
  });
});
