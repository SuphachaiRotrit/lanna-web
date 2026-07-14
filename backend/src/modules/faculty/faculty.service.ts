import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.faculty.findMany({ orderBy: { name: 'asc' } });
  }

  async create(data: CreateFacultyDto) {
    return this.prisma.faculty.create({ data });
  }

  async update(id: string, data: UpdateFacultyDto) {
    return this.prisma.faculty.update({ where: { id }, data });
  }

  async remove(id: string) {
    try {
      return await this.prisma.faculty.delete({ where: { id } });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException('ไม่สามารถลบคณะที่มีสาขาวิชาอยู่ได้');
      }
      throw err;
    }
  }
}
