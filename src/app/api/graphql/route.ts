import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { schema } from '@/lib/schema';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiKeyService } from '@/core/services/ApiKeyService';

const server = new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV !== 'production',
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    let session = await getServerSession(authOptions);

    // If no session, re-validate via Authorization header (never trust injected headers)
    if (!session?.user) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const apiKey = authHeader.substring(7);
        const authResult = await ApiKeyService.validateKey(apiKey);
        if (authResult) {
          session = {
            user: (authResult as any).user
          } as any;
        }
      }
    }

    return { req, session };
  },
});

export const GET = (handler as any) as (req: NextRequest, ctx?: any) => Promise<Response>;
export const POST = (handler as any) as (req: NextRequest, ctx?: any) => Promise<Response>;
