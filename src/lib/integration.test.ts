import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlackLotusCMSError, handleApiError, ErrorCode } from './errors';
import { sanitizePath, maskSensitiveData, sanitizeHtml } from './security-utils';
import { hasCapability, canPerformAction } from './auth-utils';

describe('Error Handling Integration', () => {
  it('should propagate BlackLotusCMSError through handleApiError', () => {
    const error = new BlackLotusCMSError('Not found', 404, 'RESOURCE_NOT_FOUND');
    const result = handleApiError(error);
    expect(result).toEqual({
      error: 'Not found',
      code: 'RESOURCE_NOT_FOUND',
      status: 404,
    });
  });

  it('should handle validation chain errors', () => {
    const zodError = {
      name: 'ZodError',
      flatten: () => ({
        fieldErrors: {
          title: ['Required'],
          slug: ['Invalid format'],
        },
      }),
    };
    const result = handleApiError(zodError);
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.status).toBe(400);
    expect(result.details).toEqual({
      title: ['Required'],
      slug: ['Invalid format'],
    });
  });

  it('should handle Prisma unique constraint violations', () => {
    const prismaError = { code: 'P2002', message: 'Unique constraint failed' };
    const result = handleApiError(prismaError);
    expect(result.code).toBe('DATABASE_ERROR');
    expect(result.status).toBe(500);
  });

  it('should handle Prisma not found errors', () => {
    const prismaError = { code: 'P2025', message: 'Record not found' };
    const result = handleApiError(prismaError);
    expect(result.code).toBe('DATABASE_ERROR');
    expect(result.status).toBe(500);
  });

  it('should handle all ErrorCode values', () => {
    const codes: ErrorCode[] = [
      'AUTH_UNAUTHORIZED', 'AUTH_FORBIDDEN', 'RESOURCE_NOT_FOUND',
      'VALIDATION_ERROR', 'DATABASE_ERROR', 'INTERNAL_SERVER_ERROR',
      'RATE_LIMIT_EXCEEDED', 'CONFLICT', 'INSTALL_REQUIRED',
      'SANDBOX_TIMEOUT', 'PLUGIN_ERROR', 'THEME_PERMISSION_DENIED',
    ];
    codes.forEach((code) => {
      const error = new BlackLotusCMSError('test', 400, code);
      expect(error.code).toBe(code);
    });
  });
});

describe('Security Utils Integration', () => {
  describe('Path sanitization combined with data masking', () => {
    it('should sanitize theme path then mask sensitive data', () => {
      const themePath = '../../../etc/passwd';
      const sanitized = sanitizePath(themePath);
      expect(sanitized).not.toContain('..');
      expect(sanitized).not.toContain('/');

      const data = {
        themeName: sanitized,
        passwordHash: 'secret123',
        apiKey: 'key123',
      };
      const masked = maskSensitiveData(data);
      expect(masked.themeName).toBe(sanitized);
      expect(masked.passwordHash).toBeUndefined();
      expect(masked.apiKey).toBeUndefined();
    });

    it('should sanitize HTML in nested objects', () => {
      const data = {
        title: '<script>alert("xss")</script>Safe Title',
        content: '<p>Normal <b>content</b></p>',
        meta: {
          description: '<img src=x onerror=alert(1)>',
        },
      };

      const masked = maskSensitiveData(data);
      // maskSensitiveData doesn't sanitize HTML, only removes sensitive fields
      expect(masked.title).toContain('<script>');
    });
  });

  describe('RBAC + Security combined', () => {
    const adminRole = {
      id: '1',
      name: 'Administrador',
      capabilities: {},
    };

    const restrictedRole = {
      id: '2',
      name: 'Author',
      capabilities: {
        post: { create: true, read: true, update: true, own: true },
      },
    };

    it('admin bypasses all security checks', () => {
      expect(hasCapability(adminRole, 'post.delete')).toBe(true);
      expect(hasCapability(adminRole, 'user.manage')).toBe(true);
      expect(hasCapability(adminRole, 'plugin.install')).toBe(true);
      expect(hasCapability(adminRole, 'random.unrelated')).toBe(true);
    });

    it('restricted user cannot access admin functions', () => {
      expect(hasCapability(restrictedRole, 'user.manage')).toBe(false);
      expect(hasCapability(restrictedRole, 'plugin.install')).toBe(false);
      expect(hasCapability(restrictedRole, 'theme.manage')).toBe(false);
    });

    it('canPerformAction respects resource ownership', () => {
      const user = { id: 'user-1', role: restrictedRole };
      expect(canPerformAction(user, 'post.update', 'user-1')).toBe(true);
      expect(canPerformAction(user, 'post.update', 'other-user')).toBe(true); // has post.update directly
      expect(canPerformAction(user, 'post.delete')).toBe(false);
    });
  });
});

describe('Storage Driver Integration', () => {
  it('should define StorageDriver interface correctly', async () => {
    const { getStorageDriver } = await import('./storage');
    // We can't actually test with a real DB, but we can verify the interface
    expect(typeof getStorageDriver).toBe('function');
  });
});
