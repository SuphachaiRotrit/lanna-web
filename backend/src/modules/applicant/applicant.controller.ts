import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { ApplicantService } from './applicant.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { QueryApplicantDto } from './dto/query-applicant.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { UpdateReportInDto } from './dto/update-report-in.dto';
import { CheckStatusDto } from './dto/check-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('api')
export class ApplicantController {
  constructor(private readonly applicantService: ApplicantService) {}

  // ========================================
  // PUBLIC ENDPOINTS
  // ========================================

  /**
   * Submit new application (rate limited)
   */
  @Post('applicants')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 submissions per minute
  async create(@Body() createDto: CreateApplicantDto) {
    return this.applicantService.create(createDto);
  }

  /**
   * Upload document for applicant
   */
  @Post('applicants/:id/documents')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 4 * 1024 * 1024 },
    }),
  )
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: string,
    @Req() req: Request,
  ) {
    const isAdmin = !!req.user;
    return this.applicantService.addDocument(id, file, type, isAdmin);
  }

  /**
   * Check application status by application number + national ID (rate limited)
   */
  @Post('applicants/check-status')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async checkStatus(@Body() dto: CheckStatusDto) {
    return this.applicantService.checkStatus(dto.applicationNumber, dto.nationalId);
  }

  // ========================================
  // ADMIN ENDPOINTS (Protected)
  // ========================================

  /**
   * List all applicants with search, filter, pagination
   */
  @Get('admin/applicants')
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: QueryApplicantDto) {
    return this.applicantService.findAll(query);
  }

  /**
   * Get single applicant detail
   */
  @Get('admin/applicants/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.applicantService.findOne(id);
  }

  /**
   * Update applicant status
   */
  @Patch('admin/applicants/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.applicantService.updateStatus(id, dto.status, dto.reason);
  }

  /**
   * Set exam result
   */
  @Patch('admin/applicants/:id/exam')
  @UseGuards(JwtAuthGuard)
  async updateExam(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.applicantService.updateExamResult(id, dto.examResult);
  }

  /**
   * Approve or reject report-in
   */
  @Patch('admin/applicants/:id/report-in')
  @UseGuards(JwtAuthGuard)
  async updateReportIn(
    @Param('id') id: string,
    @Body() dto: UpdateReportInDto,
  ) {
    return this.applicantService.updateReportIn(
      id,
      dto.reportInStatus,
      dto.reason,
    );
  }
}
