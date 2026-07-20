import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

const SIGNED_URL_TTL = 60 * 60 * 24; // 24h, recomputed on every request

@Injectable()
export class BannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(adminOnly: boolean = false) {
    const banners = await this.prisma.banner.findMany({
      where: adminOnly ? {} : { isActive: true },
      orderBy: { order: 'asc' },
    });

    return Promise.all(
      banners.map(async (b) => ({
        ...b,
        imageUrl: await this.uploadService.getSignedUrl(
          b.imageKey,
          SIGNED_URL_TTL,
        ),
      })),
    );
  }

  async create(data: CreateBannerDto) {
    const count = await this.prisma.banner.count();
    return this.prisma.banner.create({ data: { ...data, order: count } });
  }

  async update(id: string, data: UpdateBannerDto) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  async remove(id: string) {
    const banner = await this.prisma.banner.delete({ where: { id } });
    await this.uploadService.deleteFile(banner.imageKey);
    return banner;
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, order) =>
        this.prisma.banner.update({ where: { id }, data: { order } }),
      ),
    );
    return this.findAll(true);
  }
}
