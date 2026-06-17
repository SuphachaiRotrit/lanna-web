import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { ApplicantModule } from '../applicant/applicant.module';

@Module({
  imports: [ApplicantModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
