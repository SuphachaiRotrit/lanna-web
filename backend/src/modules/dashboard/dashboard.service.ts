import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(year?: number) {
    const currentYear = new Date().getFullYear() + 543;
    const targetYear = year ?? currentYear;

    const [
      totalApplicants,
      thisYearApplicants,
      reportedInCount,
      statusCounts,
      examResultCounts,
      examByProgramCounts,
      programCounts,
      genderCounts,
      monthlyTrend,
      recentApplicants,
    ] = await Promise.all([
      // Total all-time
      this.prisma.applicant.count(),

      // Selected year
      this.prisma.applicant.count({
        where: { applicationYear: targetYear },
      }),

      // Confirmed report-ins (selected year)
      this.prisma.applicant.count({
        where: { applicationYear: targetYear, reportInStatus: 'CONFIRMED' },
      }),

      // By status (selected year)
      this.prisma.applicant.groupBy({
        by: ['status'],
        where: { applicationYear: targetYear },
        _count: { id: true },
      }),

      // By exam result (selected year)
      this.prisma.applicant.groupBy({
        by: ['examResult'],
        where: { applicationYear: targetYear },
        _count: { id: true },
      }),

      // By program + exam result (selected year)
      this.prisma.applicant.groupBy({
        by: ['programId', 'examResult'],
        where: { applicationYear: targetYear },
        _count: { id: true },
      }),

      // By program (selected year)
      this.prisma.applicant.groupBy({
        by: ['programId'],
        where: { applicationYear: targetYear },
        _count: { id: true },
      }),

      // By gender (selected year)
      this.prisma.applicant.groupBy({
        by: ['gender'],
        where: { applicationYear: targetYear },
        _count: { id: true },
      }),

      // Monthly trend (selected year)
      this.prisma.$queryRaw`
        SELECT
          EXTRACT(MONTH FROM submitted_at) as month,
          COUNT(*)::int as count
        FROM applicants
        WHERE application_year = ${targetYear}
        GROUP BY EXTRACT(MONTH FROM submitted_at)
        ORDER BY month
      `,

      // Recent 5 applicants (selected year)
      this.prisma.applicant.findMany({
        where: { applicationYear: targetYear },
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

    // Get program names for programCounts
    const programIds = programCounts.map((p) => p.programId);
    const programs = await this.prisma.program.findMany({
      where: { id: { in: programIds } },
      select: { id: true, name: true },
    });

    const programMap = new Map(programs.map((p) => [p.id, p.name]));

    // Fold programId+examResult rows into one {passed, failed} pair per program
    const examByProgramMap = new Map<string, { passed: number; failed: number }>();
    for (const row of examByProgramCounts) {
      if (row.examResult !== 'PASSED' && row.examResult !== 'FAILED') continue;
      const entry = examByProgramMap.get(row.programId) || { passed: 0, failed: 0 };
      if (row.examResult === 'PASSED') entry.passed = row._count.id;
      else entry.failed = row._count.id;
      examByProgramMap.set(row.programId, entry);
    }

    return {
      overview: {
        totalApplicants,
        thisYearApplicants,
        currentYear: targetYear,
        reportedInCount,
      },
      statusBreakdown: statusCounts.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      examResultBreakdown: examResultCounts.map((e) => ({
        examResult: e.examResult,
        count: e._count.id,
      })),
      examByProgramBreakdown: Array.from(examByProgramMap.entries()).map(
        ([programId, counts]) => ({
          programId,
          programName: programMap.get(programId) || 'Unknown',
          ...counts,
        }),
      ),
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
}
