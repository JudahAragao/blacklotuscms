import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { schema } from '@/lib/schema';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const server = new ApolloServer({
  schema,
  // Desativar em produção para evitar ataques de introspecção
  introspection: process.env.NODE_ENV !== 'production',
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    let session = await getServerSession(authOptions);

    // Suporte para API Key via headers injetados pelo proxy
    if (!session?.user) {
      const apiUserId = req.headers.get('x-api-user-id');
      const apiUserRole = req.headers.get('x-api-user-role');

      if (apiUserId && apiUserRole) {
        session = {
          user: {
            id: apiUserId,
            role: JSON.parse(apiUserRole)
          }
        } as any;
      }
    }

    return { req, session };
  },
});

export { handler as GET, handler as POST };
