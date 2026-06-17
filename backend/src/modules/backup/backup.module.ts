import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './backup.service';
import { BackupScheduler } from './backup.scheduler';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [ScheduleModule.forRoot(), UploadModule],
  providers: [BackupService, BackupScheduler],
  exports: [BackupService],
})
export class BackupModule {}
