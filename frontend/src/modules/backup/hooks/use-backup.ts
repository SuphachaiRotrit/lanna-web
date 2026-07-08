import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBackupLogsApi, triggerBackupApi } from "@/services/backup.service";
import { toast } from "sonner";

export const useBackupLogs = () => {
  return useQuery({
    queryKey: ["backup-logs"],
    queryFn: async () => {
      const [promise] = await fetchBackupLogsApi();
      return promise;
    }
  });
};

export const useBackupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const loadingToast = toast.loading('กำลังเริ่มกระบวนการสำรองข้อมูลไปยัง Google Drive...');
      try {
        const [promise] = await triggerBackupApi();
        const res = await promise;
        toast.success('สำรองข้อมูลสำเร็จ!', { id: loadingToast });
        return res.data;
      } catch (err: any) {
        toast.error('การสำรองข้อมูลล้มเหลว: ' + (err.response?.data?.message || 'โปรดตรวจสอบการตั้งค่า Google API'), { id: loadingToast });
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-logs"] });
    }
  });
};
