import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// ponytail: seed value only — real value lives in DB and is edited via the admin Settings UI thereafter
const DEFAULT_APPLICATION_YEAR = 2570;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentApplicationYear(): Promise<number> {
    const setting = await this.prisma.setting.findFirst();
    if (setting) return setting.currentApplicationYear;

    const created = await this.prisma.setting.create({
      data: { currentApplicationYear: DEFAULT_APPLICATION_YEAR },
    });
    return created.currentApplicationYear;
  }

  async setCurrentApplicationYear(year: number): Promise<number> {
    const existing = await this.prisma.setting.findFirst();
    const updated = existing
      ? await this.prisma.setting.update({
          where: { id: existing.id },
          data: { currentApplicationYear: year },
        })
      : await this.prisma.setting.create({
          data: { currentApplicationYear: year },
        });
    return updated.currentApplicationYear;
  }
}
