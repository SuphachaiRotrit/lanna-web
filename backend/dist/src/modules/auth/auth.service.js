"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../../prisma/prisma.service");
const turnstile_util_1 = require("../../common/utils/turnstile.util");
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService, turnstileService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.turnstileService = turnstileService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(loginDto) {
        await this.turnstileService.verifyToken(loginDto.turnstileToken);
        const admin = await this.prisma.admin.findUnique({
            where: { email: loginDto.email },
        });
        if (!admin || !admin.isActive) {
            this.logger.warn(`Login attempt for non-existent/inactive account: ${loginDto.email}`);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (admin.lockedUntil && admin.lockedUntil > new Date()) {
            const remainingMinutes = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
            this.logger.warn(`Login attempt on locked account: ${admin.email} (locked for ${remainingMinutes} more minutes)`);
            throw new common_1.ForbiddenException(`บัญชีถูกล็อคชั่วคราว กรุณาลองใหม่ในอีก ${remainingMinutes} นาที`);
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, admin.passwordHash);
        if (!isPasswordValid) {
            const newAttempts = admin.failedLoginAttempts + 1;
            const updateData = { failedLoginAttempts: newAttempts };
            await this.prisma.auditLog.create({
                data: {
                    action: 'LOGIN_FAILURE',
                    entity: 'auth',
                    adminId: admin.id,
                    details: { email: admin.email, attemptCount: newAttempts },
                },
            }).catch(() => { });
            if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
                updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
                this.logger.warn(`Account locked due to ${MAX_LOGIN_ATTEMPTS} failed attempts: ${admin.email}`);
            }
            await this.prisma.admin.update({
                where: { id: admin.id },
                data: updateData,
            });
            const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
            if (remainingAttempts > 0) {
                throw new common_1.UnauthorizedException(`อีเมลหรือรหัสผ่านไม่ถูกต้อง (เหลืออีก ${remainingAttempts} ครั้งก่อนบัญชีจะถูกล็อค)`);
            }
            else {
                throw new common_1.ForbiddenException(`บัญชีถูกล็อคเป็นเวลา ${LOCK_DURATION_MINUTES} นาที เนื่องจากใส่รหัสผ่านผิดติดกัน ${MAX_LOGIN_ATTEMPTS} ครั้ง`);
            }
        }
        await this.prisma.admin.update({
            where: { id: admin.id },
            data: {
                lastLoginAt: new Date(),
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'LOGIN_SUCCESS',
                entity: 'auth',
                adminId: admin.id,
                details: { email: admin.email },
            },
        }).catch(() => { });
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
    async refreshToken(token) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const admin = await this.prisma.admin.findUnique({
                where: { id: payload.sub },
            });
            if (!admin || !admin.isActive) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const newPayload = {
                sub: admin.id,
                email: admin.email,
                role: admin.role,
            };
            return {
                accessToken: this.jwtService.sign(newPayload),
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async createAdmin(email, password, fullName, role = 'STAFF') {
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
    async validateAdmin(id) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        turnstile_util_1.TurnstileService])
], AuthService);
//# sourceMappingURL=auth.service.js.map