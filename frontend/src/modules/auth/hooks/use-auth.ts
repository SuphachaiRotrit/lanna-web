import { useMutation } from "@tanstack/react-query";
import { loginApi, logoutApi } from "@/services/auth.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../providers/AuthProvider";

export const useAuth = () => {
  const router = useRouter();
  const { user, isLoading, refreshUser } = useAuthContext();

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const [promise] = await loginApi(credentials);
      return promise;
    },
    onSuccess: async (res) => {
      // รอให้ Browser บันทึก Cookie สักครู่ (100ms) กัน Race Condition
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // ดึงข้อมูลโปรไฟล์ใหม่จาก Cookie ที่เพิ่งได้มา
      await refreshUser();
      
      toast.success("เข้าสู่ระบบสำเร็จ", {
        description: `ยินดีต้อนรับเข้าใช้งานระบบ`
      });
      
      router.push("/admin/dashboard");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  });

  const logout = async () => {
    try {
      const [promise] = await logoutApi();
      await promise;
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // เคลียร์ทุกอย่างรวมถึง Cache ใน LocalStorage ที่อาจจะเคยมี
      localStorage.clear();
      await refreshUser(); // จะกลายเป็น null
      router.push("/admin/login");
      toast.info("ออกจากระบบแล้ว");
    }
  };

  return {
    user,
    isLoading,
    loginMutation,
    logout
  };
};
