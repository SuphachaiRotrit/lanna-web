import {
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /**
   * List backup run history (admin)
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/backup/logs')
  async getLogs() {
    return this.backupService.getBackupHistory();
  }

  /**
   * Trigger a backup run on demand (admin)
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/backup/trigger')
  async trigger() {
    await this.backupService.performBackup();
    return { success: true };
  }

  /**
   * Scheduled trigger — called by Vercel Cron, authenticated via CRON_SECRET
   * instead of a JWT since the caller isn't a logged-in admin.
   */
  @Post('backup/cron')
  async cronTrigger(@Headers('authorization') authHeader?: string) {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      throw new UnauthorizedException();
    }
    await this.backupService.performBackup();
    return { success: true };
  }
}
