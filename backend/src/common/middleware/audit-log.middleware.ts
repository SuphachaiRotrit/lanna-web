import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditLogMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Only log mutating operations on admin routes
    if (
      req.path.startsWith('/api/admin') &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
    ) {
      const originalSend = res.send;
      const prisma = this.prisma;

      res.send = function (body) {
        // Log after response
        const adminUser = (req as any).user;
        prisma.auditLog
          .create({
            data: {
              action: `${req.method} ${req.path}`,
              entity: req.path.split('/')[3] || 'unknown', // e.g., "applicants"
              entityId: (req.params.id as string) || null,
              adminId: adminUser?.id || null,
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
          .catch((err) => {
            // Don't block response for logging errors
            Logger.error('Failed to create audit log', err);
          });

        return originalSend.call(this, body);
      };
    }
    next();
  }
}
