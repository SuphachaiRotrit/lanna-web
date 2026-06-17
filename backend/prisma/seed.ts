import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create super admin
  const adminPassword = await bcrypt.hash('Admin@2024!', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@mbu-lanna.ac.th' },
    update: {},
    create: {
      email: 'admin@mbu-lanna.ac.th',
      passwordHash: adminPassword,
      fullName: 'ผู้ดูแลระบบ',
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create programs
  const programs = [
    {
      name: 'พุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา',
      nameEn: 'Bachelor of Buddhism',
      faculty: 'คณะศาสนาและปรัชญา',
      degree: 'ปริญญาตรี',
    },
    {
      name: 'ศึกษาศาสตรบัณฑิต สาขาวิชาการสอนภาษาไทย',
      nameEn: 'Bachelor of Education in Thai Language Teaching',
      faculty: 'คณะศึกษาศาสตร์',
      degree: 'ปริญญาตรี',
    },
    {
      name: 'ศึกษาศาสตรบัณฑิต สาขาวิชาการสอนภาษาอังกฤษ',
      nameEn: 'Bachelor of Education in English Language Teaching',
      faculty: 'คณะศึกษาศาสตร์',
      degree: 'ปริญญาตรี',
    },
    {
      name: 'ศึกษาศาสตรบัณฑิต สาขาวิชาการสอนสังคมศึกษา',
      nameEn: 'Bachelor of Education in Social Studies Teaching',
      faculty: 'คณะศึกษาศาสตร์',
      degree: 'ปริญญาตรี',
    },
    {
      name: 'รัฐศาสตรบัณฑิต สาขาวิชาการปกครอง',
      nameEn: 'Bachelor of Political Science in Government',
      faculty: 'คณะสังคมศาสตร์',
      degree: 'ปริญญาตรี',
    },
    {
      name: 'ศิลปศาสตรบัณฑิต สาขาวิชาภาษาอังกฤษ',
      nameEn: 'Bachelor of Arts in English',
      faculty: 'คณะมนุษยศาสตร์',
      degree: 'ปริญญาตรี',
    },
  ];

  for (const program of programs) {
    const created = await prisma.program.upsert({
      where: { id: program.name }, // will not match, forces create
      update: {},
      create: program,
    });
    console.log(`✅ Program: ${created.name}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
