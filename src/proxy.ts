import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SecretsService } from "@/lib/secrets";
import { ApiKeyService } from "@/core/services/ApiKeyService";
import { logger } from "@/lib/logger";
import { rateLimiter } from "@/lib/rate-limiter";

// Authentication logic from original proxy.ts
const authProxy = withAuth(
  function proxy(req) {
    // @ts-ignore
    const token = req.nextauth?.token;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Unified proxy for Next.js 16
export default async function proxy(req: NextRequest, event: any) {
  const path = req.nextUrl.pathname;
  const isInstalled = await SecretsService.isInstalled();

  if (!isInstalled) {
    if (path.startsWith('/install') || path.startsWith('/api/install') || path.startsWith('/assets')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/install', req.url));
  }

  if (path.startsWith('/install')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (path.includes('.') && !path.startsWith('/api') && !path.startsWith('/assets') && !path.startsWith('/uploads') && !path.includes('favicon')) {
    return new NextResponse(null, { status: 404 });
  }

  // API Key validation with Dynamic Rate Limiting
  if (path.startsWith('/api/v1') || path.startsWith('/api/graphql')) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const apiKey = authHeader.substring(7);
      try {
        const authResult = await ApiKeyService.validateKey(apiKey);
        if (authResult) {
          const { user, rateLimit, id: keyId } = authResult as any;

          // Apply Dynamic Rate Limit (Redis or Memory)
          if (!await rateLimiter.check(keyId, rateLimit)) {
            logger.warn(`[Proxy] Rate limit exceeded for key: ${keyId}`, { path, ip: req.ip });
            return NextResponse.json(
              { error: 'Request limit exceeded (Rate Limit)', code: 'RATE_LIMIT_EXCEEDED' },
              { status: 429 }
            );
          }

          const requestHeaders = new Headers(req.headers);
          requestHeaders.set('x-api-user-id', user.id);
          requestHeaders.set('x-api-user-role', JSON.stringify(user.role));

          return NextResponse.next({
            request: {
              headers: requestHeaders,
            }
          });
        }
      } catch (error) {
        logger.error("[Proxy] Error validating API Key:", error);
      }
    }
  }

  if (path.startsWith('/admin') || path.startsWith('/api/v1') || path.startsWith('/api/graphql')) {
    return (authProxy as any)(req, event);
  }

  return NextResponse.next();
}

export const config: any = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
