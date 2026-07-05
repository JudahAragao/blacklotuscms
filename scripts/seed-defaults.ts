import { prisma } from '../src/lib/prisma';

async function main() {
  const defaults = [
    { slug: 'post', label: 'Posts' },
    { slug: 'page', label: 'Pages', hierarchical: true },
  ];

  console.log('🌱 Populando PostTypes padrão...');

  for (const pt of defaults) {
    await prisma.postType.upsert({
      where: { slug: pt.slug },
      update: {
        hierarchical: pt.hierarchical || false
      },
      create: pt,
    });
    console.log(`- ${pt.label} OK`);
  }

  // Desconectar não é estritamente necessário via Proxy mas é boa prática em scripts
  // await (prisma as any).$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
