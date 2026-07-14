import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listFacultiesAdminApi,
  createFacultyApi,
  updateFacultyApi,
  deleteFacultyApi
} from "@/services/faculty.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/call-api";

export const useFaculties = () => {
  const [progress, setProgress] = useState(0);
  const query = useQuery({
    queryKey: ["admin-faculties"],
    queryFn: async () => {
      setProgress(0);
      const [resPromise] = await listFacultiesAdminApi();
      const data = await resPromise;
      setProgress(100);
      return data;
    },
  });
  return { ...query, progress };
};

export const useFacultyMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const [promise] = await createFacultyApi(data);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faculties"] });
      toast.success("เพิ่มคณะสำเร็จ");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถเพิ่มข้อมูลได้"));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
      const [promise] = await updateFacultyApi(id, data);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faculties"] });
      toast.success("แก้ไขข้อมูลสำเร็จ");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถแก้ไขข้อมูลได้"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const [promise] = await deleteFacultyApi(id);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faculties"] });
      toast.success("ลบคณะสำเร็จ");
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
