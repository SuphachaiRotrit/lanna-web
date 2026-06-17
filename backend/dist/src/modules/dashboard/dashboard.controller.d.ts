import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<{
        overview: {
            totalApplicants: number;
            thisYearApplicants: number;
            currentYear: number;
        };
        statusBreakdown: {
            status: import(".prisma/client").$Enums.ApplicationStatus;
            count: number;
        }[];
        programBreakdown: {
            programId: string;
            programName: string;
            count: number;
        }[];
        genderBreakdown: {
            gender: import(".prisma/client").$Enums.Gender;
            count: number;
        }[];
        monthlyTrend: unknown;
        recentApplicants: {
            id: string;
            program: {
                name: string;
            };
            prefixName: string;
            firstName: string;
            lastName: string;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            submittedAt: Date;
            applicationNumber: string;
        }[];
    }>;
}
