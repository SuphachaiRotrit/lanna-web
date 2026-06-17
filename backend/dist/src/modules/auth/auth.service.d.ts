import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { TurnstileService } from '../../common/utils/turnstile.util';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly turnstileService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, turnstileService: TurnstileService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.AdminRole;
        };
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
    }>;
    createAdmin(email: string, password: string, fullName: string, role?: 'SUPER_ADMIN' | 'STAFF'): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
    }>;
    validateAdmin(id: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.AdminRole;
    } | null>;
}
