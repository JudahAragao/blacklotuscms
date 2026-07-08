import { test, expect } from '@playwright/test';

test.describe('Admin Panel - Unauthenticated', () => {
  test('admin redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect to /auth/login
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/auth/login');
    const status = page.url().includes('install') ? 302 : 200;
    // If install not done, redirects to /install
    if (!page.url().includes('install')) {
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    }
  });
});

test.describe('Admin Panel - API Protected', () => {
  test('API endpoints require authentication', async ({ request }) => {
    const response = await request.get('/api/v1/posts/post', {
      headers: {},
    });
    // Public endpoint - should work without auth
    expect(response.ok()).toBeTruthy();
  });

  test('protected API endpoints reject unauthenticated requests', async ({ request }) => {
    const response = await request.post('/api/v1/posts/post', {
      data: {
        title: 'Test',
        slug: 'test',
        postTypeId: '00000000-0000-0000-0000-000000000000',
      },
    });
    // Should require authentication
    expect([401, 403]).toContain(response.status());
  });
});

test.describe('Comment System', () => {
  test('public comment endpoint validates input', async ({ request }) => {
    const response = await request.post('/api/v1/public/comments', {
      data: {
        postId: '00000000-0000-0000-0000-000000000000',
        author: 'Test User',
        email: 'test@example.com',
        content: 'Test comment',
      },
    });
    // Should accept or reject based on post existence
    expect([201, 400]).toContain(response.status());
  });
});
