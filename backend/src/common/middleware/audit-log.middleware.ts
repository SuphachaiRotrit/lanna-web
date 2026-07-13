import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditLogMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Only log mutating operations on admin routes
    if (
      req.path.startsWith('/api/admin') &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
    ) {
      res.on('finish', () => {
        this.prisma.auditLog
          .create({
            data: {
              action: `${req.method} ${req.path}`,
              entity: req.path.split('/')[3] || 'unknown', // e.g., "applicants"
              entityId: (req.params.id as string) || null,
              adminId: req.user?.id || null,
              ipAddress:
                (req.headers['x-forwarded-for'] as string) ||
                req.socket.remoteAddress ||
                null,
              userAgent: req.headers['user-agent'] || null,
              details: {
                statusCode: res.statusCode,
                method: req.method,
                path: req.path,
              },
            },
          })
          .catch((err: unknown) => {
            // Don't block response for logging errors
            Logger.error('Failed to create audit log', err);
          });
      });
    }
    next();
  }
}
