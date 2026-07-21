// One-off: applicants submitted before the current-application-year setting existed
// were stamped with applicationYear computed from the calendar (2569) instead of the
// intended recruiting year (2570). Bumps applicationYear only — applicationNumber
// (e.g. MBU-2569-0001) is left untouched since it's already an issued reference number.
// Usage: npx ts-node -r tsconfig-paths/register prisma/backfill-application-year-2570.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const FROM_YEAR = 2569;
const TO_YEAR = 2570;

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.applicant.updateMany({
    where: { applicationYear: FROM_YEAR },
    data: { applicationYear: TO_YEAR },
  });
  console.log(`Updated ${result.count} applicant(s): applicationYear ${FROM_YEAR} -> ${TO_YEAR}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
