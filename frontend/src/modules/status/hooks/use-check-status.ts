import { useMutation } from '@tanstack/react-query';
import { checkApplicantStatusApi } from '@/services/applicant.service';

export const useCheckStatus = () => {
  return useMutation({
    mutationFn: async ({ nationalId, birthDate, turnstileToken }: { nationalId: string; birthDate: string; turnstileToken: string }) => {
      const [promise] = await checkApplicantStatusApi(nationalId, birthDate, turnstileToken);
      const res = await promise;
      return res.data;
    },
  });
};
