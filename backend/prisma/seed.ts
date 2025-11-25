import { prisma } from '../src/prisma';
import { hashPassword } from '../src/utils/auth';

async function main() {
  const adminEmail = 'admin@freshstudio.hr';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await hashPassword('changeme123');
    await prisma.user.create({ data: { email: adminEmail, passwordHash, role: 'admin' } });
    console.log('Seeded admin user');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
