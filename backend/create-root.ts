import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'root@mbu-lanna.ac.th';
  const password = 'mbu123456';
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash: hashedPassword, isActive: true },
    create: {
      email,
      passwordHash: hashedPassword,
      fullName: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  console.log(`New Admin created/updated: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
