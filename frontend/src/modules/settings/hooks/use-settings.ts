import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettingApi, updateSettingApi } from "@/services/settings.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/call-api";

export const useSetting = () => {
  return useQuery({
    queryKey: ["app-setting"],
    queryFn: async () => {
      const [promise] = await getSettingApi();
      return promise;
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currentApplicationYear: number) => {
      const [promise] = await updateSettingApi({ currentApplicationYear });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-setting"] });
      toast.success("บันทึกปีการศึกษาปัจจุบันสำเร็จ");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถบันทึกได้"));
    },
  });
};
