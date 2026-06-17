import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { TurnstileService } from '../../common/utils/turnstile.util';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly turnstileService: TurnstileService,
  ) {}

  async login(loginDto: LoginDto) {
    // 1. Verify Turnstile CAPTCHA
    await this.turnstileService.verifyToken(loginDto.turnstileToken);

    // 2. Find admin by email
    const admin = await this.prisma.admin.findUnique({
      where: { email: loginDto.email },
    });

    if (!admin || !admin.isActive) {
      this.logger.warn(`Login attempt for non-existent/inactive account: ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (admin.lockedUntil.getTime() - Date.now()) / 60000,
      );
      this.logger.warn(`Login attempt on locked account: ${admin.email} (locked for ${remainingMinutes} more minutes)`);
      throw new ForbiddenException(
        `บัญชีถูกล็อคชั่วคราว กรุณาลองใหม่ในอีก ${remainingMinutes} นาที`,
      );
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.passwordHash,
    );

    if (!isPasswordValid) {
      // Increment failed attempts
      const newAttempts = admin.failedLoginAttempts + 1;
      const updateData: any = { failedLoginAttempts: newAttempts };

      // Log Failed Attempt
      await this.prisma.auditLog.create({
        data: {
          action: 'LOGIN_FAILURE',
          entity: 'auth',
          adminId: admin.id,
          details: { email: admin.email, attemptCount: newAttempts },
        },
      }).catch(() => {});

      // Lock account if max attempts reached
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + LOCK_DURATION_MINUTES * 60 * 1000,
        );
        this.logger.warn(
          `Account locked due to ${MAX_LOGIN_ATTEMPTS} failed attempts: ${admin.email}`,
        );
      }

      await this.prisma.admin.update({
        where: { id: admin.id },
        data: updateData,
      });

      const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
      if (remainingAttempts > 0) {
        throw new UnauthorizedException(
          `อีเมลหรือรหัสผ่านไม่ถูกต้อง (เหลืออีก ${remainingAttempts} ครั้งก่อนบัญชีจะถูกล็อค)`,
        );
      } else {
        throw new ForbiddenException(
          `บัญชีถูกล็อคเป็นเวลา ${LOCK_DURATION_MINUTES} นาที เนื่องจากใส่รหัสผ่านผิดติดกัน ${MAX_LOGIN_ATTEMPTS} ครั้ง`,
        );
      }
    }

    // 5. Login successful — reset failed attempts
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Audit Log: Success
    await this.prisma.auditLog.create({
      data: {
        action: 'LOGIN_SUCCESS',
        entity: 'auth',
        adminId: admin.id,
        details: { email: admin.email },
      },
    }).catch(() => {});

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    this.logger.log(`Admin logged in successfully: ${admin.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const admin = await this.prisma.admin.findUnique({
        where: { id: payload.sub },
      });

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      };

      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async createAdmin(
    email: string,
    password: string,
    fullName: string,
    role: 'SUPER_ADMIN' | 'STAFF' = 'STAFF',
  ) {
    const hashedPassword = await bcrypt.hash(password, 12);

    return this.prisma.admin.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        role,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async validateAdmin(id: string) {
    return this.prisma.admin.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });
  }
}
