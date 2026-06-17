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
import { ApplicantService } from './applicant.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { QueryApplicantDto } from './dto/query-applicant.dto';
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
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: string,
    @Req() req: any,
  ) {
    const isAdmin = !!req.user;
    return this.applicantService.addDocument(id, file, type, isAdmin);
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
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.applicantService.updateStatus(id, status);
  }
}
