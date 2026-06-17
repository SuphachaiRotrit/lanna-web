import { ConfigService } from '@nestjs/config';
export declare class TurnstileService {
    private configService;
    private readonly logger;
    private readonly secretKey;
    constructor(configService: ConfigService);
    verifyToken(token: string): Promise<boolean>;
}
