import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

const CACHE_TTL_SECONDS = 60;

// ponytail: REST-based client (no persistent connection), so it's safe to
// share across serverless invocations the same way the Prisma pool isn't.
// Null when Upstash env vars aren't set (local/docker-compose dev) — caching
// is skipped rather than required.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

type DashboardStats = Awaited<ReturnType<DashboardService['computeStats']>>;

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  async getStats(year?: number) {
    const targetYear =
      year ?? (await this.settingsService.getCurrentApplicationYear());
    const cacheKey = `dashboard:stats:${targetYear}`;

    if (redis) {
      const cached = await redis.get<DashboardStats>(cacheKey);
      if (cached) return cached;
    }

    const stats = await this.computeStats(targetYear);

    // ponytail: TTL-only invalidation — stats can lag up to 60s behind writes
    // (new applications, status changes). Add active invalidation on writes
    // if that lag becomes a real problem.
    if (redis) await redis.set(cacheKey, stats, { ex: CACHE_TTL_SECONDS });

    return stats;
  }

  private async computeStats(targetYear: number) {
    // Sequential, not Promise.all: DATABASE_URL is pooled with connection_limit=1
    // for Vercel serverless (see DEPLOY.md). Also fetch the year's applicants
    // ONCE and derive every breakdown from it in JS instead of one groupBy per
    // breakdown — trades 7 round-trips for 1.
    // ponytail: fine while applicants/year stay in the hundreds-thousands; if
    // that grows to tens of thousands, switch back to DB-side groupBy.
    const totalApplicants = await this.prisma.applicant.count();

    const yearApplicants = await this.prisma.applicant.findMany({
      where: { applicationYear: targetYear },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        prefixName: true,
        firstName: true,
        lastName: true,
        applicationNumber: true,
        status: true,
        examResult: true,
        reportInStatus: true,
        gender: true,
        submittedAt: true,
        programId: true,
        program: { select: { name: true } },
      },
    });

    const monthlyTrend = await this.prisma.$queryRaw`
      SELECT
        EXTRACT(MONTH FROM submitted_at) as month,
        COUNT(*)::int as count
      FROM applicants
      WHERE application_year = ${targetYear}
      GROUP BY EXTRACT(MONTH FROM submitted_at)
      ORDER BY month
    `;

    let reportedInCount = 0;
    const statusCounts = new Map<string, number>();
    const examResultCounts = new Map<string, number>();
    const genderCounts = new Map<string, number>();
    const programCounts = new Map<string, { name: string; count: number }>();
    const examByProgram = new Map<
      string,
      { name: string; passed: number; failed: number }
    >();
    const programStatusCounts = new Map<
      string,
      {
        applied: number;
        pending: number;
        approved: number;
        examPassed: number;
        reportedIn: number;
      }
    >();

    for (const a of yearApplicants) {
      if (a.reportInStatus === 'CONFIRMED') reportedInCount++;
      statusCounts.set(a.status, (statusCounts.get(a.status) || 0) + 1);
      examResultCounts.set(
        a.examResult,
        (examResultCounts.get(a.examResult) || 0) + 1,
      );
      genderCounts.set(a.gender, (genderCounts.get(a.gender) || 0) + 1);

      const program = programCounts.get(a.programId) ?? {
        name: a.program.name,
        count: 0,
      };
      program.count++;
      programCounts.set(a.programId, program);

      if (a.examResult === 'PASSED' || a.examResult === 'FAILED') {
        const entry = examByProgram.get(a.programId) ?? {
          name: a.program.name,
          passed: 0,
          failed: 0,
        };
        if (a.examResult === 'PASSED') entry.passed++;
        else entry.failed++;
        examByProgram.set(a.programId, entry);
      }

      const statusEntry = programStatusCounts.get(a.programId) ?? {
        applied: 0,
        pending: 0,
        approved: 0,
        examPassed: 0,
        reportedIn: 0,
      };
      statusEntry.applied++;
      if (a.status === 'PENDING') statusEntry.pending++;
      if (a.status === 'APPROVED') statusEntry.approved++;
      if (a.examResult === 'PASSED') statusEntry.examPassed++;
      if (a.reportInStatus === 'CONFIRMED') statusEntry.reportedIn++;
      programStatusCounts.set(a.programId, statusEntry);
    }

    // All programs currently open for enrollment, so a program with zero
    // applicants still shows a (zeroed) row in the summary table.
    const openPrograms = await this.prisma.program.findMany({
      where: { isActive: true },
      orderBy: [{ faculty: { name: 'asc' } }, { name: 'asc' }],
      select: { id: true, name: true },
    });

    const recentApplicants = yearApplicants.slice(0, 5).map((a) => ({
      id: a.id,
      prefixName: a.prefixName,
      firstName: a.firstName,
      lastName: a.lastName,
      applicationNumber: a.applicationNumber,
      status: a.status,
      submittedAt: a.submittedAt,
      program: { name: a.program.name },
    }));

    return {
      overview: {
        totalApplicants,
        thisYearApplicants: yearApplicants.length,
        currentYear: targetYear,
        reportedInCount,
      },
      statusBreakdown: Array.from(statusCounts.entries()).map(
        ([status, count]) => ({ status, count }),
      ),
      examResultBreakdown: Array.from(examResultCounts.entries()).map(
        ([examResult, count]) => ({ examResult, count }),
      ),
      examByProgramBreakdown: Array.from(examByProgram.entries()).map(
        ([programId, { name, passed, failed }]) => ({
          programId,
          programName: name,
          passed,
          failed,
        }),
      ),
      programBreakdown: Array.from(programCounts.entries()).map(
        ([programId, { name, count }]) => ({
          programId,
          programName: name,
          count,
        }),
      ),
      programStatusBreakdown: openPrograms.map((p) => {
        const counts = programStatusCounts.get(p.id) ?? {
          applied: 0,
          pending: 0,
          approved: 0,
          examPassed: 0,
          reportedIn: 0,
        };
        return {
          programId: p.id,
          programName: p.name,
          ...counts,
        };
      }),
      genderBreakdown: Array.from(genderCounts.entries()).map(
        ([gender, count]) => ({ gender, count }),
      ),
      monthlyTrend,
      recentApplicants,
    };
  }

  async exportSummaryExcel(year?: number): Promise<Buffer> {
    const stats = await this.getStats(year);
    const rows = stats.programStatusBreakdown;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MBU Lanna Registration System';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('สรุปยอดผู้สมัคร');

    sheet.columns = [
      { key: 'program', width: 45 },
      { key: 'applied', width: 14 },
      { key: 'pending', width: 14 },
      { key: 'approved', width: 16 },
      { key: 'examPassed', width: 14 },
      { key: 'reportedIn', width: 16 },
    ];

    sheet.mergeCells('A1:B1');
    const yearLabelCell = sheet.getCell('A1');
    yearLabelCell.value = 'ปีการศึกษา';
    yearLabelCell.font = { bold: true };
    const yearValueCell = sheet.getCell('C1');
    yearValueCell.value = stats.overview.currentYear;
    yearValueCell.font = { bold: true };
    sheet.addRow([]);

    const headerRow = sheet.addRow([
      'สาขาวิชาที่เปิดรับสมัคร',
      'ผู้สมัครปีนี้',
      'รอตรวจสอบ',
      'ผ่านการสมัคร',
      'สอบผ่าน',
      'รายงานตัวแล้ว',
    ]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF7D9BE' },
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    sheet.getCell(`A${headerRow.number}`).alignment = { vertical: 'middle', horizontal: 'left' };

    const totals = { applied: 0, pending: 0, approved: 0, examPassed: 0, reportedIn: 0 };
    for (const r of rows) {
      const row = sheet.addRow([
        r.programName,
        r.applied || '',
        r.pending || '',
        r.approved || '',
        r.examPassed || '',
        r.reportedIn || '',
      ]);
      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 1 ? 'left' : 'center',
        };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      totals.applied += r.applied;
      totals.pending += r.pending;
      totals.approved += r.approved;
      totals.examPassed += r.examPassed;
      totals.reportedIn += r.reportedIn;
    }

    const totalRow = sheet.addRow([
      'รวม',
      totals.applied,
      totals.pending,
      totals.approved,
      totals.examPassed,
      totals.reportedIn,
    ]);
    totalRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 1 ? 'center' : 'center',
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF7D9BE' },
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
