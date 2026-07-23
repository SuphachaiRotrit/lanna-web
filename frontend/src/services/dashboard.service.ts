import { callAPI, AbortFunction } from "@/lib/call-api";
import { ApiResponse } from "@/types";
import { Applicant } from "./applicant.service";

export interface DashboardStats {
  overview: {
    totalApplicants: number;
    thisYearApplicants: number;
    currentYear: number;
    reportedInCount: number;
  };
  statusBreakdown: Array<{ status: string; count: number }>;
  examResultBreakdown: Array<{ examResult: string; count: number }>;
  examByProgramBreakdown: Array<{ programId: string; programName: string; passed: number; failed: number }>;
  programBreakdown: Array<{ programName: string; count: number }>;
  programStatusBreakdown: Array<{
    programId: string;
    programName: string;
    applied: number;
    pending: number;
    approved: number;
    examPassed: number;
    reportedIn: number;
  }>;
  monthlyTrend: Array<{ month: number; count: number }>;
  recentApplicants: Applicant[];
}

/**
 * ADMIN: GET /admin/dashboard - สถิติภาพรวม (แยกตามปี)
 */
export const fetchDashboardStatsApi = async (year?: number): Promise<[Promise<ApiResponse<DashboardStats>>, AbortFunction]> => {
  return callAPI<ApiResponse<DashboardStats>>("GET", "/admin/dashboard", null, { params: year ? { year } : undefined });
};

/**
 * ADMIN: GET /admin/dashboard/export/excel - ส่งออกตารางสรุปยอดผู้สมัครเป็น Excel
 */
export const exportDashboardSummaryExcelApi = async (year: number): Promise<[Promise<Blob>, AbortFunction]> => {
  return callAPI<Blob>("GET", "/admin/dashboard/export/excel", null, { params: { year }, responseType: 'blob' });
};
