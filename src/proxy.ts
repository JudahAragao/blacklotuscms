import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ApiKeyService } from "@/core/services/ApiKeyService";
import { logger } from "@/lib/logger";
import { rateLimiter } from "@/lib/rate-limiter";
import { initCMS } from "@/lib/init";
import crypto from "crypto";

const CSP_NONCE_ENABLED = process.env.CSP_NONCE_ENABLED === 'true';

function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

function buildCSP(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://static.cloudflareinsights.com`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "frame-src https://www.youtube.com https://player.vimeo.com https://www.google.com https://open.spotify.com https://codepen.io https://codesandbox.io",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
  ].join('; ');
}

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

export default async function proxy(req: NextRequest, event: any) {
  await initCMS();
  const path = req.nextUrl.pathname;

  if (path.includes('.') && !path.startsWith('/api') && !path.startsWith('/assets') && !path.startsWith('/uploads') && !path.includes('favicon') && !path.includes('sitemap.xml')) {
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

          if (!await rateLimiter.check(keyId, rateLimit)) {
            logger.warn(`[Proxy] Rate limit exceeded for key: ${keyId}`, { path });
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

  const response = NextResponse.next();

  if (CSP_NONCE_ENABLED) {
    const nonce = generateNonce();
    response.headers.set('x-nonce', nonce);
    response.headers.set('Content-Security-Policy', buildCSP(nonce));
  }

  return response;
}

export const config: any = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
