import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, response: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.AdminRole;
        };
    }>;
    refresh(refreshTokenDto: RefreshTokenDto, response: Response): Promise<{
        accessToken: string;
    }>;
    logout(response: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(req: Request): Promise<{
        user: {
            id: any;
            email: any;
            fullName: any;
            role: any;
        };
    }>;
}
