import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasCapability } from './auth-utils';
import { logger } from './logger';

export type ApiHandler = (
  req: NextRequest,
  context: any,
  session: any
) => Promise<NextResponse>;

/**
 * Consolidated security wrapper for API routes.
 * Consumes authentication from both NextAuth and API Key Proxy.
 */
export function withApiAuth(handler: ApiHandler, requiredCapability?: string) {
  return async (req: NextRequest, context: any) => {
    try {
      let user: any = null;

      // 1. Try to get from NextAuth (Browser session)
      const session = await getServerSession(authOptions);
      if (session?.user) {
        user = session.user;
      }

      // 2. If no session, try headers injected by the Proxy (API Key)
      if (!user) {
        const apiUserId = req.headers.get('x-api-user-id');
        const apiUserRole = req.headers.get('x-api-user-role');

        if (apiUserId && apiUserRole) {
          user = {
            id: apiUserId,
            role: JSON.parse(apiUserRole)
          };
        }
      }

      // 3. Block if there is no identity
      if (!user) {
        return NextResponse.json(
          { 
            error: 'Unauthorized. Provide a valid API Key or log in.',
            code: 'AUTH_UNAUTHORIZED' 
          },
          { status: 401 }
        );
      }

      // 4. RBAC Check (Capabilities)
      if (requiredCapability) {
        if (!user.role || !hasCapability(user.role, requiredCapability)) {
          logger.warn(`Access denied: ${requiredCapability}`, { userId: user.id });
          return NextResponse.json(
            { 
              error: `No permission to perform this action`, 
              code: 'AUTH_FORBIDDEN',
              required: requiredCapability
            },
            { status: 403 }
          );
        }
      }

      // Execute the handler passing the normalized session
      return await handler(req, context, { user });
    } catch (error: any) {
      logger.error(`API authentication error: ${error.message}`, { path: req.nextUrl.pathname });
      return NextResponse.json(
        { error: 'Internal authentication error', code: 'INTERNAL_SERVER_ERROR' },
        { status: 500 }
      );
    }
  };
}
