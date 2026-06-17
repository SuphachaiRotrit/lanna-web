import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany({
    select: { email: true, fullName: true, isActive: true }
  });
  console.log('Admins in Database:', JSON.stringify(admins, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
