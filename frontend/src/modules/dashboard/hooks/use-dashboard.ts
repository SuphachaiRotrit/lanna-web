import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStatsApi } from "@/services/dashboard.service";

export const useDashboardStats = (year?: number) => {
  return useQuery({
    queryKey: ["admin-dashboard-stats", year],
    queryFn: async () => {
      const [promise] = await fetchDashboardStatsApi(year);
      return promise;
    },
    refetchInterval: 5 * 60 * 1000, // อัปเดตทุก 5 นาที
  });
};
