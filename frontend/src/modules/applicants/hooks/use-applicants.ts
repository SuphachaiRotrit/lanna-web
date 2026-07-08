import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listApplicantsApi, updateApplicantStatusApi, exportApplicantsApi } from "@/services/applicant.service";
import { toast } from "sonner";

export const useApplicants = (filters: any) => {
  return useQuery({
    queryKey: ["applicants", filters],
    queryFn: async () => {
      const [promise] = await listApplicantsApi(filters);
      return promise;
    },
  });
};

export const useApplicantMutation = () => {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const [promise] = await updateApplicantStatusApi(id, status);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      toast.success("อัปเดตสถานะสำเร็จ");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "ไม่สามารถอัปเดตสถานะได้");
    }
  });

  const exportData = useMutation({
    mutationFn: async ({ type, filters }: { type: 'excel' | 'pdf', filters: any }) => {
      const [promise] = await exportApplicantsApi(type, { status: filters.status, year: filters.year });
      const blob = await promise;
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `applicants_export_${new Date().getTime()}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    },
    onSuccess: () => {
      toast.success("ส่งออกข้อมูลสำเร็จ");
    },
    onError: (err: any) => {
      toast.error("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    }
  });

  return {
    updateStatus,
    exportData
  };
};
