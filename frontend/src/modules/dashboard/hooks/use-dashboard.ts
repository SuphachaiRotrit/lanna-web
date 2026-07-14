import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchDashboardStatsApi } from "@/services/dashboard.service";

export const useDashboardStats = () => {
  const [progress, setProgress] = useState(0);
  const query = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      setProgress(0);
      const [promise] = await fetchDashboardStatsApi(setProgress);
      const data = await promise;
      setProgress(100);
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // อัปเดตทุก 5 นาที
  });
  return { ...query, progress };
};
