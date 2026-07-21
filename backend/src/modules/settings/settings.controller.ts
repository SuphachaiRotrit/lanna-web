import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller('api')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Public: read the current recruiting year (landing page, applicant form)
   */
  @Get('settings')
  async get() {
    return {
      currentApplicationYear:
        await this.settingsService.getCurrentApplicationYear(),
    };
  }

  /**
   * Admin: update the current recruiting year (SUPER_ADMIN only)
   */
  @Put('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async update(@Body() dto: UpdateSettingDto) {
    return {
      currentApplicationYear:
        await this.settingsService.setCurrentApplicationYear(
          dto.currentApplicationYear,
        ),
    };
  }
}
