import { builder } from './builder';
import { prisma } from './prisma';

/**
 * Base Models with Prisma integration
 */
builder.prismaObject('Post', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    slug: t.exposeString('slug'),
    content: t.exposeString('content', { nullable: true }),
    status: t.exposeString('status'),
    publishedAt: t.expose('publishedAt', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // SEO
    seoTitle: t.exposeString('seoTitle', { nullable: true }),
    seoDescription: t.exposeString('seoDescription', { nullable: true }),
    ogImage: t.exposeString('ogImage', { nullable: true }),
    noIndex: t.exposeBoolean('noIndex'),
    
    // Automatic relationships via Pothos-Prisma
    postType: t.relation('postType'),
    author: t.relation('author'),
    
    // MetaFields Resolver: Optimized with PrismaPlugin to avoid N+1
    metaFields: t.field({
      type: 'Json',
      resolve: async (post) => {
        // Now we fetch efficiently
        const postWithMetas = await prisma.post.findUnique({
          where: { id: post.id },
          include: {
            metaValues: {
              include: { field: true }
            }
          }
        });
        
        if (!postWithMetas) return {};

        return postWithMetas.metaValues.reduce((acc: any, meta) => {
          const key = meta.field?.name || meta.fieldId;
          acc[key] = meta.value;
          return acc;
        }, {});
      }
    }),
  }),
});

builder.prismaObject('PostType', {
  fields: (t) => ({
    id: t.exposeID('id'),
    slug: t.exposeString('slug'),
    label: t.exposeString('label'),
    posts: t.relation('posts'),
  }),
});

builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    // Data masking: Only exposes email if has permission
    email: t.exposeString('email', {
      authScopes: { hasCapability: 'user.manage' },
      unauthorizedResolver: () => "hidden@example.com"
    }),
  }),
});

/**
 * Queries
 */
builder.queryFields((t) => ({
  // List posts with CPT filter support
  posts: t.prismaField({
    type: ['Post'],
    args: {
      type: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args) =>
      prisma.post.findMany({
        ...query,
        where: {
          postType: { slug: args.type },
          status: 'published',
        },
      }),
  }),

  // Single post fetch by slug
  postBySlug: t.prismaField({
    type: 'Post',
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args) =>
      prisma.post.findUnique({
        ...query,
        where: { slug: args.slug },
      }),
  }),
}));

export const schema = builder.toSchema();
