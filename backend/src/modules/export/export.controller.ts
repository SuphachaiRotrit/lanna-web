import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StatusFilterDto } from '../applicant/dto/query-applicant.dto';

interface ExportBody {
  ids?: string[];
  status?: StatusFilterDto;
  year?: number;
  programId?: string;
}

@Controller('api/admin/export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('excel')
  async exportExcel(@Body() body: ExportBody, @Res() res: Response) {
    const buffer = await this.exportService.exportExcel(
      { status: body.status, year: body.year, programId: body.programId },
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
      { status: body.status, year: body.year, programId: body.programId },
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
}
