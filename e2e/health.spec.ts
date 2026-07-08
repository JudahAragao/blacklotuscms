import { test, expect } from '@playwright/test';

test.describe('Health Check', () => {
  test('GET /api/health returns healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.database).toBe('connected');
    expect(body.timestamp).toBeDefined();
  });
});

test.describe('GraphQL Endpoint', () => {
  test('POST /api/graphql accepts queries', async ({ request }) => {
    const response = await request.post('/api/graphql', {
      data: {
        query: '{ __typename }',
      },
    });
    // Introspection may be disabled in production, but endpoint should respond
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('REST API', () => {
  test('GET /api/v1/posts/post returns array', async ({ request }) => {
    const response = await request.get('/api/v1/posts/post');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /api/v1/public/search with short query returns empty', async ({ request }) => {
    const response = await request.get('/api/v1/public/search?q=ab');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });

  test('POST /api/v1/public/comments rejects invalid data', async ({ request }) => {
    const response = await request.post('/api/v1/public/comments', {
      data: { invalid: true },
    });
    expect(response.status()).toBe(400);
  });
});
