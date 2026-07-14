import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/services/user.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/call-api";

export const useUsers = () => {
  const [progress, setProgress] = useState(0);
  const query = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      setProgress(0);
      const [resPromise] = await listUsersApi();
      const data = await resPromise;
      setProgress(100);
      return data;
    },
  });
  return { ...query, progress };
};

export const useUserMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateUserPayload) => {
      const [promise] = await createUserApi(data);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("เพิ่มผู้ใช้สำเร็จ");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถเพิ่มผู้ใช้ได้"));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserPayload }) => {
      const [promise] = await updateUserApi(id, data);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("แก้ไขข้อมูลสำเร็จ");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถแก้ไขข้อมูลได้"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const [promise] = await deleteUserApi(id);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("ปิดใช้งานบัญชีสำเร็จ");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถปิดใช้งานบัญชีได้"));
    }
  });

  return { createMutation, updateMutation, deleteMutation };
};
