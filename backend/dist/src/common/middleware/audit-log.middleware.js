"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditLogMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditLogMiddleware = AuditLogMiddleware_1 = class AuditLogMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditLogMiddleware_1.name);
    }
    async use(req, res, next) {
        if (req.path.startsWith('/api/admin') &&
            ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            const originalSend = res.send;
            const prisma = this.prisma;
            res.send = function (body) {
                const adminUser = req.user;
                prisma.auditLog
                    .create({
                    data: {
                        action: `${req.method} ${req.path}`,
                        entity: req.path.split('/')[3] || 'unknown',
                        entityId: req.params.id || null,
                        adminId: adminUser?.id || null,
                        ipAddress: req.headers['x-forwarded-for'] ||
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
                    common_1.Logger.error('Failed to create audit log', err);
                });
                return originalSend.call(this, body);
            };
        }
        next();
    }
};
exports.AuditLogMiddleware = AuditLogMiddleware;
exports.AuditLogMiddleware = AuditLogMiddleware = AuditLogMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogMiddleware);
//# sourceMappingURL=audit-log.middleware.js.map