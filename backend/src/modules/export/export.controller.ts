import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { ApplicantService } from '../applicant/applicant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  StatusFilterDto,
  ExamResultFilterDto,
  ReportInStatusFilterDto,
} from '../applicant/dto/query-applicant.dto';
import { PurgeDto } from './dto/purge.dto';

interface ExportBody {
  ids?: string[];
  status?: StatusFilterDto;
  examResult?: ExamResultFilterDto;
  reportInStatus?: ReportInStatusFilterDto;
  year?: number;
  programId?: string;
}

@Controller('api/admin/export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly applicantService: ApplicantService,
  ) {}

  @Post('excel')
  async exportExcel(@Body() body: ExportBody, @Res() res: Response) {
    const buffer = await this.exportService.exportExcel(
      {
        status: body.status,
        examResult: body.examResult,
        reportInStatus: body.reportInStatus,
        year: body.year,
        programId: body.programId,
      },
      body.ids,
    );

    const filename = `applicants_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });
    res.send(buffer);
  }

  @Post('pdf')
  async exportPdf(@Body() body: ExportBody, @Res() res: Response) {
    const buffer = await this.exportService.exportPdf(
      {
        status: body.status,
        examResult: body.examResult,
        reportInStatus: body.reportInStatus,
        year: body.year,
        programId: body.programId,
      },
      body.ids,
    );

    const filename = `applicants_${new Date().toISOString().split('T')[0]}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });
    res.send(buffer);
  }

  /**
   * SUPER_ADMIN only: export a year's applicants to Excel, then delete
   * them (and their storage files). Only years older than the 3-year
   * retention window are eligible — enforced in ApplicantService.
   */
  @Post('purge')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async purge(@Body() body: PurgeDto, @Res() res: Response) {
    const buffer = await this.exportService.exportExcel({ year: body.year });
    await this.applicantService.deletePurgeYear(body.year);

    const filename = `applicants_purged_${body.year}_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });
    res.send(buffer);
  }
}
