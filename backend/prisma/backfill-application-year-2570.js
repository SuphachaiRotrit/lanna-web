"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const FROM_YEAR = 2569;
const TO_YEAR = 2570;
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=backfill-application-year-2570.js.map