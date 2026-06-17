import { ApplicantService } from '../applicant/applicant.service';
export declare class ExportService {
    private readonly applicantService;
    private readonly logger;
    constructor(applicantService: ApplicantService);
    exportExcel(query: {
        status?: string;
        year?: number;
        programId?: string;
    }, ids?: string[]): Promise<Buffer>;
    exportPdf(query: {
        status?: string;
        year?: number;
        programId?: string;
    }, ids?: string[]): Promise<Buffer>;
}
