import { logger } from "@/lib/logger";

/**
 * Standardized error codes for the system.
 */
export type ErrorCode = 
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_FORBIDDEN'
  | 'RESOURCE_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_SERVER_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'CONFLICT'
  | 'INSTALL_REQUIRED'
  | 'SANDBOX_TIMEOUT'
  | 'PLUGIN_ERROR'
  | 'THEME_PERMISSION_DENIED';

/**
 * Custom error class for BlackLotusCMS.
 * Allows capturing business errors with HTTP status and associated error codes.
 */
export class BlackLotusCMSError extends Error {
  public statusCode: number;
  public code: ErrorCode;

  constructor(message: string, statusCode: number = 400, code: ErrorCode = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = 'BlackLotusCMSError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Utility to format error responses in APIs.
 */
export function handleApiError(error: any) {
  if (error instanceof BlackLotusCMSError) {
    return { 
      error: error.message, 
      code: error.code,
      status: error.statusCode 
    };
  }
  
  if (error.code?.startsWith('P')) {
    logger.error('[Prisma Error]:', error);
    return { 
      error: 'Database operation error', 
      code: 'DATABASE_ERROR' as ErrorCode,
      status: 500 
    };
  }

  if (error.name === 'ZodError') {
    return {
      error: 'Data validation error',
      code: 'VALIDATION_ERROR' as ErrorCode,
      details: error.flatten().fieldErrors,
      status: 400
    };
  }
  
  logger.error('[INTERNAL ERROR]:', error);
  return { 
    error: 'An internal server error occurred', 
    code: 'INTERNAL_SERVER_ERROR' as ErrorCode,
    status: 500 
  };
}
