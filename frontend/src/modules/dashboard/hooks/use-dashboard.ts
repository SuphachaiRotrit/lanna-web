import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStatsApi } from "@/services/dashboard.service";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [promise] = await fetchDashboardStatsApi();
      return promise;
    },
    refetchInterval: 5 * 60 * 1000, // อัปเดตทุก 5 นาที
  });
};
