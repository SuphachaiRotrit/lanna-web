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
  programBreakdown: Array<{ programName: string; count: number }>;
  monthlyTrend: Array<{ month: number; count: number }>;
  recentApplicants: Applicant[];
}

/**
 * ADMIN: GET /admin/dashboard - สถิติภาพรวม (แยกตามปี)
 */
export const fetchDashboardStatsApi = async (year?: number): Promise<[Promise<ApiResponse<DashboardStats>>, AbortFunction]> => {
  return callAPI<ApiResponse<DashboardStats>>("GET", "/admin/dashboard", null, { params: year ? { year } : undefined });
};
