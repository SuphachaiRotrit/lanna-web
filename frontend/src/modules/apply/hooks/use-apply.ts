import { useMutation, useQuery } from "@tanstack/react-query";
import { createApplicantApi, uploadDocumentApi } from "@/services/applicant.service";
import { listProgramsApi } from "@/services/program.service";
import { toast } from "sonner";
import { useState } from "react";
import { getErrorMessage } from "@/lib/call-api";

export const useApply = () => {
  const [currentStep, setCurrentStep] = useState(1);

  // ดึงรายการหลักสูตรที่เปิดรับ
  const programsQuery = useQuery({
    queryKey: ["programs-public"],
    queryFn: async () => {
      const [promise] = await listProgramsApi();
      return promise;
    }
  });

  // ยื่นใบสมัคร
  const applyMutation = useMutation({
    mutationFn: async ({ values, files }: { values: Record<string, unknown>, files: Record<string, File | File[] | null> }) => {
      const loadingToast = toast.loading('กำลังบันทึกข้อมูลใบสมัคร...');

      try {
        const [resPromise] = await createApplicantApi(values);
        const res = await resPromise;
        const id = res.data.id;

        // อัปโหลดไฟล์แบบขนาน
        const uploadPromises: Promise<unknown>[] = [];

        Object.entries(files).forEach(([type, fileOrFiles]) => {
          if (!fileOrFiles) return;

          if (Array.isArray(fileOrFiles)) {
            // กรณีเป็น Array (เช่น Transcript 3 ฉบับ)
            fileOrFiles.forEach(file => {
              uploadPromises.push((async () => {
                const [p] = await uploadDocumentApi(id, type, file);
                return p;
              })());
            });
          } else {
            // กรณีเป็นไฟล์เดียว
            uploadPromises.push((async () => {
              const [p] = await uploadDocumentApi(id, type, fileOrFiles);
              return p;
            })());
          }
        });

        await Promise.all(uploadPromises);
        toast.success('ส่งใบสมัครเรียนสำเร็จแล้ว!', { id: loadingToast });
        return res.data;
      } catch (error) {
        toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการส่งใบสมัคร'), { id: loadingToast });
        throw error;
      }
    }
  });

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  return {
    currentStep,
    nextStep,
    prevStep,
    programsQuery,
    applyMutation
  };
};
