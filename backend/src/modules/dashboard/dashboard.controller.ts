import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/admin/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getStats(@Query('year') year?: string) {
    return this.dashboardService.getStats(year ? Number(year) : undefined);
  }

  @Get('export/excel')
  async exportSummaryExcel(
    @Query('year') year: string | undefined,
    @Res() res: Response,
  ) {
    const buffer = await this.dashboardService.exportSummaryExcel(
      year ? Number(year) : undefined,
    );
    const filename = `applicant_summary_${year ?? new Date().getFullYear()}.xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });
    res.send(buffer);
  }
}
