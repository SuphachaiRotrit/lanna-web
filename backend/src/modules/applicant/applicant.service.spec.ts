import { ApplicationStatus } from '@prisma/client';
import { ApplicantService } from './applicant.service';

describe('ApplicantService.updateStatus', () => {
  const buildService = (update: jest.Mock) => {
    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue({ id: '1' }),
        update,
      },
    };
    return new ApplicantService(prisma as any, {} as any, {} as any);
  };

  it('stores rejectionReason when status is REJECTED', async () => {
    const update = jest.fn().mockResolvedValue({});
    const service = buildService(update);

    await service.updateStatus('1', ApplicationStatus.REJECTED, 'เอกสารไม่ครบถ้วน');

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: ApplicationStatus.REJECTED,
          rejectionReason: 'เอกสารไม่ครบถ้วน',
        }),
      }),
    );
  });

  it('does not set rejectionReason for other statuses', async () => {
    const update = jest.fn().mockResolvedValue({});
    const service = buildService(update);

    await service.updateStatus('1', ApplicationStatus.APPROVED);

    const dataArg = update.mock.calls[0][0].data;
    expect(dataArg.rejectionReason).toBeUndefined();
  });
});
