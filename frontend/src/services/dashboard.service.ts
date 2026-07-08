import { callAPI, AbortFunction } from "@/lib/call-api";
import { ApiResponse } from "@/types";

export interface DashboardStats {
  overview: {
    totalApplicants: number;
    thisYearApplicants: number;
    currentYear: number;
  };
  statusBreakdown: Array<{ status: string; count: number }>;
  programBreakdown: Array<{ programName: string; count: number }>;
  monthlyTrend: Array<{ month: number; count: number }>;
  recentApplicants: any[];
}

/**
 * ADMIN: GET /admin/dashboard - สถิติภาพรวมทั้งหมด
 */
export const fetchDashboardStatsApi = async (): Promise<[Promise<ApiResponse<DashboardStats>>, AbortFunction]> => {
  return callAPI<ApiResponse<DashboardStats>>("GET", "/admin/dashboard");
};
