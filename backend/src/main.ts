import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 4000);
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
  const isDev = configService.get('NODE_ENV') === 'development';

  // =============================================
  // STATIC ASSETS: เปิดให้เข้าถึงไฟล์ในเครื่องได้
  // =============================================
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // =============================================
  // SECURITY: Helmet
  // =============================================
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:', isDev ? '*' : ''], 
          scriptSrc: ["'self'", "https://challenges.cloudflare.com"],
          frameSrc: ["'self'", "https://challenges.cloudflare.com"],
          connectSrc: ["'self'", frontendUrl, "https://challenges.cloudflare.com"],
          frameAncestors: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false, 
    }),
  );

  app.enableCors({
    origin: [frontendUrl],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    maxAge: 86400,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: !isDev,
    }),
  );

  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📋 Mode: ${isDev ? 'Development' : 'Production'} (Storage: Dynamic)`);
}

bootstrap();
