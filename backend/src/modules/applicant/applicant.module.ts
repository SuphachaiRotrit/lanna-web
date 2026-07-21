import { Module } from '@nestjs/common';
import { ApplicantService } from './applicant.service';
import { ApplicantController } from './applicant.controller';
import { UploadModule } from '../upload/upload.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [UploadModule, SettingsModule],
  controllers: [ApplicantController],
  providers: [ApplicantService],
  exports: [ApplicantService],
})
export class ApplicantModule {}
