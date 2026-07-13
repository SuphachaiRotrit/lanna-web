import { ApplicationStatus } from '@prisma/client';
import { ApplicantService } from './applicant.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { TurnstileService } from '../../common/utils/turnstile.util';

type UpdateArgs = { data: Record<string, unknown> };
type UpdateMock = jest.Mock<Promise<unknown>, [UpdateArgs]>;

describe('ApplicantService.updateStatus', () => {
  const buildService = (update: UpdateMock) => {
    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue({ id: '1' }),
        update,
      },
    } as unknown as PrismaService;
    return new ApplicantService(
      prisma,
      {} as UploadService,
      {} as TurnstileService,
    );
  };

  it('stores rejectionReason when status is REJECTED', async () => {
    const update: UpdateMock = jest
      .fn<Promise<unknown>, [UpdateArgs]>()
      .mockResolvedValue({});
    const service = buildService(update);

    await service.updateStatus(
      '1',
      ApplicationStatus.REJECTED,
      'เอกสารไม่ครบถ้วน',
    );

    const dataArg = update.mock.calls[0][0].data;
    expect(dataArg.status).toBe(ApplicationStatus.REJECTED);
    expect(dataArg.rejectionReason).toBe('เอกสารไม่ครบถ้วน');
  });

  it('does not set rejectionReason for other statuses', async () => {
    const update: UpdateMock = jest
      .fn<Promise<unknown>, [UpdateArgs]>()
      .mockResolvedValue({});
    const service = buildService(update);

    await service.updateStatus('1', ApplicationStatus.APPROVED);

    const dataArg = update.mock.calls[0][0].data;
    expect(dataArg.rejectionReason).toBeUndefined();
  });
});
