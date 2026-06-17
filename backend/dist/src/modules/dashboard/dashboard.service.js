"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const currentYear = new Date().getFullYear() + 543;
        const [totalApplicants, thisYearApplicants, statusCounts, programCounts, genderCounts, monthlyTrend, recentApplicants,] = await Promise.all([
            this.prisma.applicant.count(),
            this.prisma.applicant.count({
                where: { applicationYear: currentYear },
            }),
            this.prisma.applicant.groupBy({
                by: ['status'],
                where: { applicationYear: currentYear },
                _count: { id: true },
            }),
            this.prisma.applicant.groupBy({
                by: ['programId'],
                where: { applicationYear: currentYear },
                _count: { id: true },
            }),
            this.prisma.applicant.groupBy({
                by: ['gender'],
                where: { applicationYear: currentYear },
                _count: { id: true },
            }),
            this.prisma.$queryRaw `
        SELECT 
          EXTRACT(MONTH FROM submitted_at) as month,
          COUNT(*)::int as count
        FROM applicants
        WHERE application_year = ${currentYear}
        GROUP BY EXTRACT(MONTH FROM submitted_at)
        ORDER BY month
      `,
            this.prisma.applicant.findMany({
                where: { applicationYear: currentYear },
                orderBy: { submittedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    prefixName: true,
                    firstName: true,
                    lastName: true,
                    applicationNumber: true,
                    status: true,
                    submittedAt: true,
                    program: { select: { name: true } },
                },
            }),
        ]);
        const programIds = programCounts.map((p) => p.programId);
        const programs = await this.prisma.program.findMany({
            where: { id: { in: programIds } },
            select: { id: true, name: true },
        });
        const programMap = new Map(programs.map((p) => [p.id, p.name]));
        return {
            overview: {
                totalApplicants,
                thisYearApplicants,
                currentYear,
            },
            statusBreakdown: statusCounts.map((s) => ({
                status: s.status,
                count: s._count.id,
            })),
            programBreakdown: programCounts.map((p) => ({
                programId: p.programId,
                programName: programMap.get(p.programId) || 'Unknown',
                count: p._count.id,
            })),
            genderBreakdown: genderCounts.map((g) => ({
                gender: g.gender,
                count: g._count.id,
            })),
            monthlyTrend,
            recentApplicants,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map