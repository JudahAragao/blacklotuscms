import { describe, it, expect } from 'vitest';
import { BlackLotusCMSError, handleApiError, ErrorCode } from './errors';

describe('BlackLotusCMSError', () => {
  it('should create error with default values', () => {
    const error = new BlackLotusCMSError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.name).toBe('BlackLotusCMSError');
  });

  it('should create error with custom status and code', () => {
    const error = new BlackLotusCMSError('Not found', 404, 'RESOURCE_NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('should be instanceof Error', () => {
    const error = new BlackLotusCMSError('Test');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('handleApiError', () => {
  it('should handle BlackLotusCMSError', () => {
    const error = new BlackLotusCMSError('Custom error', 422, 'VALIDATION_ERROR');
    const result = handleApiError(error);
    expect(result.error).toBe('Custom error');
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.status).toBe(422);
  });

  it('should handle Prisma errors', () => {
    const error = { code: 'P2002', message: 'Unique constraint' };
    const result = handleApiError(error);
    expect(result.code).toBe('DATABASE_ERROR');
    expect(result.status).toBe(500);
  });

  it('should handle ZodError', () => {
    const error = {
      name: 'ZodError',
      flatten: () => ({ fieldErrors: { email: ['Invalid'] } }),
    };
    const result = handleApiError(error);
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.status).toBe(400);
    expect(result.details).toEqual({ email: ['Invalid'] });
  });

  it('should handle unknown errors', () => {
    const error = new Error('Unknown');
    const result = handleApiError(error);
    expect(result.code).toBe('INTERNAL_SERVER_ERROR');
    expect(result.status).toBe(500);
  });
});
