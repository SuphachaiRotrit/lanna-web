import { Module, Global } from '@nestjs/common';
import { TurnstileService } from './utils/turnstile.util';

@Global()
@Module({
  providers: [TurnstileService],
  exports: [TurnstileService],
})
export class CommonModule {}
