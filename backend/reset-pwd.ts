import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@mbu-lanna.ac.th';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.admin.update({
    where: { email },
    data: { passwordHash: hashedPassword }
  });

  console.log(`Password for ${email} has been reset to: ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
