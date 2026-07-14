import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listApplicantsApi, updateApplicantStatusApi, exportApplicantsApi, getApplicantApi } from "@/services/applicant.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/call-api";

interface ApplicantFilters {
  [key: string]: unknown;
  page: number;
  limit: number;
  search: string;
  status: string;
  year: number;
}

export const useApplicants = (filters: ApplicantFilters) => {
  return useQuery({
    queryKey: ["applicants", filters],
    queryFn: async () => {
      const [promise] = await listApplicantsApi(filters);
      return promise;
    },
  });
};

export const useApplicant = (id: string | null) => {
  return useQuery({
    queryKey: ["applicant", id],
    queryFn: async () => {
      const [promise] = await getApplicantApi(id as string);
      return promise;
    },
    enabled: !!id,
  });
};

export const useApplicantMutation = () => {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string, status: string, reason?: string }) => {
      const [promise] = await updateApplicantStatusApi(id, status, reason);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["applicant"] });
      toast.success("อัปเดตสถานะสำเร็จ");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถอัปเดตสถานะได้"));
    }
  });

  const exportData = useMutation({
    mutationFn: async ({ type, filters }: { type: 'excel' | 'pdf', filters: { status: string; year: number } }) => {
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
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    }
  });

  return {
    updateStatus,
    exportData
  };
};
