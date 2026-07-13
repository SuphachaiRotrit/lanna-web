import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ProgramService } from './program.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  /**
   * Public: List active programs with availability info
   */
  @Get('programs')
  async findAll() {
    return this.programService.findAll(false);
  }

  /**
   * Admin: List ALL programs including inactive ones
   */
  @Get('admin/programs')
  @UseGuards(JwtAuthGuard)
  async findAllAdmin() {
    return this.programService.findAll(true);
  }

  /**
   * Admin: Get specific program
   */
  @Get('admin/programs/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.programService.findOne(id);
  }

  /**
   * Admin: Create program
   */
  @Post('admin/programs')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body()
    data: {
      name: string;
      nameEn?: string;
      faculty: string;
      degree: string;
      description?: string;
      duration?: string;
      maxQuota?: number;
    },
  ) {
    return this.programService.create(data);
  }

  /**
   * Admin: Update program
   */
  @Put('admin/programs/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body()
    data: Partial<{
      name: string;
      nameEn: string;
      faculty: string;
      degree: string;
      description: string;
      duration: string;
      maxQuota: number;
      isActive: boolean;
    }>,
  ) {
    return this.programService.update(id, data);
  }

  /**
   * Admin: Remove program
   */
  @Delete('admin/programs/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.programService.remove(id);
  }
}
