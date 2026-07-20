import { useMutation } from '@tanstack/react-query';
import { checkApplicantStatusApi } from '@/services/applicant.service';

export const useCheckStatus = () => {
  return useMutation({
    mutationFn: async ({ applicationNumber, nationalId }: { applicationNumber: string; nationalId: string }) => {
      const [promise] = await checkApplicantStatusApi(applicationNumber, nationalId);
      const res = await promise;
      return res.data;
    },
  });
};
