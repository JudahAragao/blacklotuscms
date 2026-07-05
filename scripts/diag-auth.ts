import { prisma } from '../src/lib/prisma';

async function diag() {
  const admin = await prisma.user.findFirst({
    where: { role: { name: 'Administrador' } },
    include: { role: true }
  });
  
  console.log('--- DIAGNÓSTICO DE AUTENTICAÇÃO ---');
  if (admin) {
    console.log('USUÁRIO:', admin.email);
    console.log('ROLE:', admin.role?.name);
    console.log('CAPABILITIES:', JSON.stringify(admin.role?.capabilities, null, 2));
  } else {
    console.log('❌ Nenhum administrador encontrado.');
  }
}

diag().catch(console.error);
