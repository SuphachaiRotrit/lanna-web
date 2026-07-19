import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SAFE_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.admin.findMany({
      select: SAFE_SELECT,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: CreateUserDto) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    return this.prisma.admin.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        passwordHash,
      },
      select: SAFE_SELECT,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const target = await this.prisma.admin.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('ไม่พบบัญชีผู้ใช้');

    const losesSuperAdmin =
      target.role === 'SUPER_ADMIN' &&
      target.isActive &&
      ((data.role && data.role !== 'SUPER_ADMIN') || data.isActive === false);
    if (losesSuperAdmin) {
      await this.assertAnotherSuperAdminExists(id);
    }

    return this.prisma.admin.update({
      where: { id },
      data: {
        fullName: data.fullName,
        role: data.role,
        isActive: data.isActive,
        ...(data.password
          ? { passwordHash: await bcrypt.hash(data.password, 12) }
          : {}),
      },
      select: SAFE_SELECT,
    });
  }

  // Soft delete: keeps the row so AuditLog.adminId stays valid.
  async remove(id: string) {
    const target = await this.prisma.admin.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('ไม่พบบัญชีผู้ใช้');

    if (target.role === 'SUPER_ADMIN' && target.isActive) {
      await this.assertAnotherSuperAdminExists(id);
    }

    return this.prisma.admin.update({
      where: { id },
      data: { isActive: false },
      select: SAFE_SELECT,
    });
  }

  private async assertAnotherSuperAdminExists(excludeId: string) {
    const count = await this.prisma.admin.count({
      where: { role: 'SUPER_ADMIN', isActive: true, id: { not: excludeId } },
    });
    if (count === 0) {
      throw new ConflictException(
        'ต้องมีผู้ดูแลระบบสูงสุด (Super Admin) ที่ใช้งานอยู่อย่างน้อย 1 บัญชีเสมอ',
      );
    }
  }
}
