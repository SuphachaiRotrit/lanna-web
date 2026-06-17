"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const admins = await prisma.admin.findMany({
        select: { email: true, fullName: true, isActive: true }
    });
    console.log('Admins in Database:', JSON.stringify(admins, null, 2));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-admin.js.map