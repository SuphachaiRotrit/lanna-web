import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProgramService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(adminOnly: boolean = false) {
    const programs = await this.prisma.program.findMany({
      where: adminOnly ? {} : { isActive: true },
      include: {
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
        _count: {
          select: { applicants: true },
        },
      },
    });
  }

  async create(data: { 
    name: string; 
    nameEn?: string; 
    faculty: string; 
    degree: string;
    description?: string;
    duration?: string;
    maxQuota?: number;
  }) {
    return this.prisma.program.create({ data });
  }

  async update(id: string, data: Partial<{ 
    name: string; 
    nameEn: string; 
    faculty: string; 
    degree: string; 
    description: string;
    duration: string;
    maxQuota: number;
    isActive: boolean;
  }>) {
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
