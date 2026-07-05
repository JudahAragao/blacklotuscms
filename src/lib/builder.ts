import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
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
  },
  authScopes: async (context) => ({
    public: true,
    authenticated: !!context.session?.user,
    hasCapability: (cap) => {
      const user = context.session?.user;
      if (!user || !user.role) return false;
      
      const capabilities = user.role.capabilities as Record<string, any>;
      // Support for nested paths or simple strings
      const keys = cap.split('.');
      let current = capabilities;
      for (const key of keys) {
        if (current[key] === undefined) return false;
        current = current[key];
      }
      return !!current;
    },
  }),
});

// Add basic scalars
builder.queryType({});
builder.mutationType({});

builder.scalarType('DateTime', {
  serialize: (date) => date.toISOString(),
  parseValue: (date: any) => new Date(date),
});

builder.scalarType('Json', {
  serialize: (val) => val,
  parseValue: (val) => val,
});
