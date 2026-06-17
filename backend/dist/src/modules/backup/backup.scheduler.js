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
var BackupScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const backup_service_1 = require("./backup.service");
let BackupScheduler = BackupScheduler_1 = class BackupScheduler {
    constructor(backupService) {
        this.backupService = backupService;
        this.logger = new common_1.Logger(BackupScheduler_1.name);
    }
    async handleMonthlyBackup() {
        this.logger.log('Monthly backup scheduled task starting...');
        try {
            await this.backupService.performBackup();
            this.logger.log('Monthly backup completed successfully');
        }
        catch (error) {
            this.logger.error(`Monthly backup failed: ${error.message}`, error.stack);
        }
    }
};
exports.BackupScheduler = BackupScheduler;
__decorate([
    (0, schedule_1.Cron)('0 2 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupScheduler.prototype, "handleMonthlyBackup", null);
exports.BackupScheduler = BackupScheduler = BackupScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [backup_service_1.BackupService])
], BackupScheduler);
//# sourceMappingURL=backup.scheduler.js.map