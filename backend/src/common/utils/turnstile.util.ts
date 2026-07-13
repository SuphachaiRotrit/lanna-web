import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey =
      this.configService.get<string>('TURNSTILE_SECRET_KEY') ||
      '1x0000000000000000000000000000000AA'; // Placeholder
  }

  async verifyToken(token: string): Promise<boolean> {
    if (!token) {
      throw new UnauthorizedException('CAPTCHA token is missing');
    }

    try {
      const response = await axios.post<TurnstileVerifyResponse>(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          secret: this.secretKey,
          response: token,
        },
      );

      const { success, 'error-codes': errorCodes } = response.data;

      if (!success) {
        this.logger.warn(
          `Turnstile verification failed: ${JSON.stringify(errorCodes)}`,
        );
        throw new UnauthorizedException('CAPTCHA verification failed');
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Turnstile error: ${message}`);
      throw new UnauthorizedException('Unable to verify CAPTCHA');
    }
  }
}
