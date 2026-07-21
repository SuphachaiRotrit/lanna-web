import { Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('api/admin/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('token')
  getToken(@Req() req: Request) {
    const token = this.notificationsService.createBrowserToken(req.user!.id);
    return { token };
  }

  @Patch('read')
  async markRead(@Req() req: Request) {
    const notificationsReadAt = await this.notificationsService.markRead(
      req.user!.id,
    );
    return { notificationsReadAt };
  }
}
