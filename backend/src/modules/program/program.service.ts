import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(adminOnly: boolean = false) {
    const programs = await this.prisma.program.findMany({
      where: adminOnly ? {} : { isActive: true },
      include: {
        faculty: true,
        _count: {
          select: { applicants: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return programs.map((p) => ({
      ...p,
      currentApplicants: p._count.applicants,
      isFull: p._count.applicants >= p.maxQuota,
    }));
  }

  async findOne(id: string) {
    return this.prisma.program.findUnique({
      where: { id },
      include: {
        faculty: true,
        _count: {
          select: { applicants: true },
        },
      },
    });
  }

  async create(data: CreateProgramDto) {
    return this.prisma.program.create({ data });
  }

  async update(id: string, data: UpdateProgramDto) {
    return this.prisma.program.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.program.delete({
      where: { id },
    });
  }
}
