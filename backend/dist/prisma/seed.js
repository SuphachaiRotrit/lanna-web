"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
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
            where: { id: program.name },
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
//# sourceMappingURL=seed.js.map