import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import type PrismaTypes from '../generated/pothos-types';
import { getDatamodel } from '../generated/pothos-types';
import { prisma } from './prisma';

/**
 * Pothos Builder with Prisma and Auth plugins
 */
export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: {
    session?: any;
  };
  AuthScopes: {
    public: boolean;
    authenticated: boolean;
    hasCapability: string;
  };
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    Json: {
      Input: unknown;
      Output: unknown;
    };
  };
}>({
  plugins: [PrismaPlugin, ScopeAuthPlugin],
  prisma: {
    client: prisma,
    dmmf: getDatamodel(),
  },
  scopeAuth: {
    authScopes: async (context: { session?: any }) => ({
      public: true,
      authenticated: !!context.session?.user,
      hasCapability: (cap: string) => {
        const user = context.session?.user;
        if (!user || !user.role) return false;

        const capabilities = user.role.capabilities as Record<string, any>;
        const keys = cap.split('.');
        let current: any = capabilities;
        for (const key of keys) {
          if (current[key] === undefined) return false;
          current = current[key];
        }
        return !!current;
      },
    }),
  },
});

// Add basic scalars
builder.queryType({});

builder.scalarType('DateTime', {
  serialize: (date) => date.toISOString(),
  parseValue: (date: any) => new Date(date),
});

builder.scalarType('Json', {
  serialize: (val) => val,
  parseValue: (val) => val,
});
