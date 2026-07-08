import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ApiKeyService } from "@/core/services/ApiKeyService";
import { logger } from "@/lib/logger";
import { rateLimiter } from "@/lib/rate-limiter";
import { initCMS } from "@/lib/init";

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

  return NextResponse.next();
}

export const config: any = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
