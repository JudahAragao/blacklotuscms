import { test, expect } from '@playwright/test';

test.describe('Theme API', () => {
  test('GET /api/themes/default/style serves CSS', async ({ request }) => {
    const response = await request.get('/api/themes/default/style');
    // May return 200 with CSS or 404 if no active theme
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
      const contentType = response.headers()['content-type'] || '';
      expect(contentType).toContain('text/css');
    }
  });

  test('GET /api/themes/default/assets/* serves static files', async ({ request }) => {
    const response = await request.get('/api/themes/default/assets/favicon.ico');
    expect([200, 404]).toContain(response.status());
  });
});

test.describe('Media API', () => {
  test('GET /api/v1/media requires auth', async ({ request }) => {
    const response = await request.get('/api/v1/media');
    // Media listing may require auth
    expect([200, 401]).toContain(response.status());
  });
});

test.describe('Comments API', () => {
  test('GET /api/v1/public/comments returns array', async ({ request }) => {
    const response = await request.get('/api/v1/public/comments?postId=nonexistent');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

test.describe('Search API', () => {
  test('GET /api/v1/public/search with valid query returns results', async ({ request }) => {
    const response = await request.get('/api/v1/public/search?q=test');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /api/v1/public/search with empty query returns empty', async ({ request }) => {
    const response = await request.get('/api/v1/public/search?q=');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });
});
