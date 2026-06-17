import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupService } from './backup.service';

@Injectable()
export class BackupScheduler {
  private readonly logger = new Logger(BackupScheduler.name);

  constructor(private readonly backupService: BackupService) {}

  /**
   * Run backup on 1st day of every month at 2:00 AM
   */
  @Cron('0 2 1 * *')
  async handleMonthlyBackup() {
    this.logger.log('Monthly backup scheduled task starting...');
    try {
      await this.backupService.performBackup();
      this.logger.log('Monthly backup completed successfully');
    } catch (error) {
      this.logger.error(
        `Monthly backup failed: ${error.message}`,
        error.stack,
      );
    }
  }
}
