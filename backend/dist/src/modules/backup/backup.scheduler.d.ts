import { BackupService } from './backup.service';
export declare class BackupScheduler {
    private readonly backupService;
    private readonly logger;
    constructor(backupService: BackupService);
    handleMonthlyBackup(): Promise<void>;
}
