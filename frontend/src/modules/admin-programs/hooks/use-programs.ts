import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listProgramsAdminApi,
  createProgramApi,
  updateProgramApi,
  deleteProgramApi
} from "@/services/program.service";
import { toast } from "sonner";
import { Program } from "@/types";
import { getErrorMessage } from "@/lib/call-api";

export const usePrograms = () => {
  const [progress, setProgress] = useState(0);
  const query = useQuery({
    queryKey: ["admin-programs"],
    queryFn: async () => {
      setProgress(0);
      const [resPromise] = await listProgramsAdminApi(setProgress);
      const data = await resPromise;
      setProgress(100);
      return data;
    },
  });
  return { ...query, progress };
};

export const useProgramMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  // Create
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Program>) => {
      const [promise] = await createProgramApi(data);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      toast.success("เพิ่มสาขาวิชาสำเร็จ");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถเพิ่มข้อมูลได้"));
    }
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Program> }) => {
      const [promise] = await updateProgramApi(id, data);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      toast.success("แก้ไขข้อมูลสำเร็จ");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถแก้ไขข้อมูลได้"));
    }
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const [promise] = await deleteProgramApi(id);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      toast.success("ลบสาขาวิชาสำเร็จ");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถลบข้อมูลได้"));
    }
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation
  };
};
