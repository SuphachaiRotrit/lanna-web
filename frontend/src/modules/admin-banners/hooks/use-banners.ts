import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBannersAdminApi,
  createBannerApi,
  updateBannerApi,
  deleteBannerApi,
  reorderBannersApi
} from "@/services/banner.service";
import { toast } from "sonner";
import { Banner } from "@/types";
import { getErrorMessage } from "@/lib/call-api";

export const useBanners = () => {
  return useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const [resPromise] = await listBannersAdminApi();
      return resPromise;
    },
  });
};

export const useBannerMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Banner>) => {
      const [promise] = await createBannerApi(data);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["home-banners"] });
      toast.success("เพิ่มสไลด์สำเร็จ");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถเพิ่มสไลด์ได้"));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Banner> }) => {
      const [promise] = await updateBannerApi(id, data);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["home-banners"] });
      toast.success("แก้ไขสไลด์สำเร็จ");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถแก้ไขสไลด์ได้"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const [promise] = await deleteBannerApi(id);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["home-banners"] });
      toast.success("ลบสไลด์สำเร็จ");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถลบสไลด์ได้"));
    }
  });

  const reorderMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const [promise] = await reorderBannersApi(ids);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["home-banners"] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถเรียงลำดับสไลด์ได้"));
    }
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    reorderMutation
  };
};
