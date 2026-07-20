import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ReorderBannersDto } from './dto/reorder-banners.dto';

@Controller('api')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  /**
   * Public: List active banners for the homepage slideshow
   */
  @Get('banners')
  async findAll() {
    return this.bannerService.findAll(false);
  }

  /**
   * Admin: List ALL banners including inactive ones
   */
  @Get('admin/banners')
  @UseGuards(JwtAuthGuard)
  async findAllAdmin() {
    return this.bannerService.findAll(true);
  }

  /**
   * Admin: Create banner
   */
  @Post('admin/banners')
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: CreateBannerDto) {
    return this.bannerService.create(data);
  }

  /**
   * Admin: Update banner
   */
  @Put('admin/banners/:id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() data: UpdateBannerDto) {
    return this.bannerService.update(id, data);
  }

  /**
   * Admin: Reorder banners
   */
  @Patch('admin/banners/reorder')
  @UseGuards(JwtAuthGuard)
  async reorder(@Body() data: ReorderBannersDto) {
    return this.bannerService.reorder(data.ids);
  }

  /**
   * Admin: Remove banner
   */
  @Delete('admin/banners/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.bannerService.remove(id);
  }
}
