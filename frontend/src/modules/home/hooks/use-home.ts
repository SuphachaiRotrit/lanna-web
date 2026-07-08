import { useQuery } from "@tanstack/react-query";
import { listProgramsApi } from "@/services/program.service";

export const useHomePrograms = () => {
  return useQuery({
    queryKey: ["home-programs"],
    queryFn: async () => {
      const [promise] = await listProgramsApi();
      return promise;
    }
  });
};
