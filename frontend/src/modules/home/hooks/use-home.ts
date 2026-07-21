import { useQuery } from "@tanstack/react-query";
import { listProgramsApi } from "@/services/program.service";
import { listBannersApi } from "@/services/banner.service";
import { getSettingApi } from "@/services/settings.service";

export const useHomePrograms = () => {
  return useQuery({
    queryKey: ["home-programs"],
    queryFn: async () => {
      const [promise] = await listProgramsApi();
      return promise;
    }
  });
};

export const useHomeBanners = () => {
  return useQuery({
    queryKey: ["home-banners"],
    queryFn: async () => {
      const [promise] = await listBannersApi();
      return promise;
    }
  });
};

export const useHomeSetting = () => {
  return useQuery({
    queryKey: ["home-setting"],
    queryFn: async () => {
      const [promise] = await getSettingApi();
      return promise;
    }
  });
};
