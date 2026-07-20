// One-off: run once after the add_national_id_hash migration to populate
// nationalIdHash for applicants created before the column existed.
// Usage: npx ts-node -r tsconfig-paths/register prisma/backfill-national-id-hash.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { EncryptionUtil } from '../src/common/utils/encryption.util';

const prisma = new PrismaClient();

async function main() {
  const applicants = await prisma.applicant.findMany({
    where: { nationalIdHash: null },
    select: { id: true, nationalId: true },
  });

  console.log(`Backfilling nationalIdHash for ${applicants.length} applicant(s)...`);

  let updated = 0;
  for (const applicant of applicants) {
    const plaintext = EncryptionUtil.decrypt(applicant.nationalId);
    await prisma.applicant.update({
      where: { id: applicant.id },
      data: { nationalIdHash: EncryptionUtil.hash(plaintext) },
    });
    updated++;
  }

  console.log(`Done. Updated ${updated} applicant(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
