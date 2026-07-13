import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createApp } from './bootstrap';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await createApp();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const isDev = configService.get('NODE_ENV') === 'development';

  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(
    `📋 Mode: ${isDev ? 'Development' : 'Production'} (Storage: Dynamic)`,
  );
}

bootstrap().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
