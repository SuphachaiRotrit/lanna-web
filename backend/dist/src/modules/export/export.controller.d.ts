import type { Response } from 'express';
import { ExportService } from './export.service';
export declare class ExportController {
    private readonly exportService;
    constructor(exportService: ExportService);
    exportExcel(body: {
        ids?: string[];
        status?: string;
        year?: number;
        programId?: string;
    }, res: Response): Promise<void>;
    exportPdf(body: {
        ids?: string[];
        status?: string;
        year?: number;
        programId?: string;
    }, res: Response): Promise<void>;
}
