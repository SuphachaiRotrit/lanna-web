# Exam Result / Report-In Approval / Program Cards / Dashboard Retention — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an exam-result stage and a report-in approval stage after the existing document-review workflow on the admin applicants page, let staff filter/browse applicants by program via cards, and let the dashboard show per-year stats (including a report-in count) with a manual, export-first 3-year data retention purge.

**Architecture:** Two new Prisma enums (`ExamResult`, `ReportInStatus`) and four new columns on `Applicant`, gated by service-layer state checks (must be `APPROVED` before setting exam result, must be `PASSED` before report-in). Two new `PATCH` endpoints on the existing `ApplicantController`, one new `POST admin/export/purge` endpoint on the existing `ExportController` (guarded to `SUPER_ADMIN`, reuses the existing Excel export before deleting). Dashboard stats gain an optional `year` query param. All new frontend UI reuses existing components (`PremiumCard`, `PremiumSelect`, `PremiumButton`, `Skeleton`) and existing hooks (`usePrograms`, `useAuth`) — no new dependencies.

**Tech Stack:** NestJS 11 + Prisma 6 + PostgreSQL (backend), Next.js + React + TanStack Query + Tailwind (frontend), Jest + ts-jest for backend unit tests. The frontend has no test runner configured in this repo — frontend tasks end with a manual dev-server verification step instead of an automated test.

## Global Constraints

- Follow existing patterns exactly: DTOs are `class-validator` classes (plain TS interfaces are NOT validated — the global `ValidationPipe` in `backend/src/bootstrap.ts` only validates real classes), guards stack as `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('SUPER_ADMIN')` (see `backend/src/modules/user/user.controller.ts`).
- All new UI text is Thai, matching the rest of the admin panel.
- Do not add new npm dependencies. Do not add a frontend test framework — none exists in this repo today.
- `AuditLogMiddleware` already logs every mutating `/api/admin` request automatically — never add manual audit-log calls.
- `Document.applicantId` already has `onDelete: Cascade` — deleting an `Applicant` row deletes its `Document` rows automatically.

---

## Part A — Exam result, report-in approval, program-card browsing

### Task 1: Prisma schema — exam result & report-in fields

**Files:**
- Modify: `backend/prisma/schema.prisma:91-137` (the `status` block and `ApplicationStatus` enum in `model Applicant`)

**Interfaces:**
- Produces: Prisma enums `ExamResult` (`NOT_YET | PASSED | FAILED`) and `ReportInStatus` (`NOT_YET | CONFIRMED | REJECTED`); new `Applicant` columns `examResult`, `reportInStatus`, `reportInReason`, `reportInAt`. Every later backend task in Part A/B imports these from `@prisma/client`.

- [ ] **Step 1: Add the fields to the `Applicant` model**

In `backend/prisma/schema.prisma`, find this block (around line 91-94):

```prisma
  // สถานะ
  status            ApplicationStatus @default(PENDING)
  applicationNumber String            @unique @map("application_number")
  applicationYear   Int               @map("application_year")
```

Replace it with:

```prisma
  // สถานะ
  status            ApplicationStatus @default(PENDING)
  applicationNumber String            @unique @map("application_number")
  applicationYear   Int               @map("application_year")

  // ผลสอบ / รายงานตัว
  examResult     ExamResult     @default(NOT_YET) @map("exam_result")
  reportInStatus ReportInStatus @default(NOT_YET) @map("report_in_status")
  reportInReason String?        @db.Text @map("report_in_reason")
  reportInAt     DateTime?      @map("report_in_at")
```

- [ ] **Step 2: Add the two new enums**

Immediately after the existing `enum ApplicationStatus { ... }` block (around line 131-137), add:

```prisma
enum ExamResult {
  NOT_YET
  PASSED
  FAILED
}

enum ReportInStatus {
  NOT_YET
  CONFIRMED
  REJECTED
}
```

- [ ] **Step 3: Run the migration**

Run (from `backend/`):
```bash
npx prisma migrate dev --name add_exam_result_report_in
```
Expected: migration file created under `backend/prisma/migrations/`, output ends with `Your database is now in sync with your schema.` and Prisma Client regenerates without errors.

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat(db): add exam result and report-in status to Applicant"
```

---

### Task 2: Backend DTOs for exam result & report-in

**Files:**
- Create: `backend/src/modules/applicant/dto/update-exam.dto.ts`
- Create: `backend/src/modules/applicant/dto/update-exam.dto.spec.ts`
- Create: `backend/src/modules/applicant/dto/update-report-in.dto.ts`
- Create: `backend/src/modules/applicant/dto/update-report-in.dto.spec.ts`

**Interfaces:**
- Consumes: Prisma enums `ExamResult`, `ReportInStatus` from Task 1.
- Produces: `UpdateExamDto { examResult: ExamResult }`, `UpdateReportInDto { reportInStatus: ReportInStatus; reason?: string }` — consumed by the controller in Task 4.

- [ ] **Step 1: Write the failing DTO tests**

`backend/src/modules/applicant/dto/update-exam.dto.spec.ts`:
```ts
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ExamResult } from '@prisma/client';
import { UpdateExamDto } from './update-exam.dto';

describe('UpdateExamDto', () => {
  it('accepts a valid exam result', async () => {
    const dto = plainToInstance(UpdateExamDto, { examResult: ExamResult.PASSED });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid exam result value', async () => {
    const dto = plainToInstance(UpdateExamDto, { examResult: 'NOT_A_REAL_RESULT' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'examResult')).toBe(true);
  });

  it('rejects a missing exam result', async () => {
    const dto = plainToInstance(UpdateExamDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'examResult')).toBe(true);
  });
});
```

`backend/src/modules/applicant/dto/update-report-in.dto.spec.ts`:
```ts
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ReportInStatus } from '@prisma/client';
import { UpdateReportInDto } from './update-report-in.dto';

describe('UpdateReportInDto', () => {
  it('requires a non-empty reason when reportInStatus is REJECTED', async () => {
    const dto = plainToInstance(UpdateReportInDto, {
      reportInStatus: ReportInStatus.REJECTED,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reason')).toBe(true);
  });

  it('passes when reportInStatus is REJECTED and reason is provided', async () => {
    const dto = plainToInstance(UpdateReportInDto, {
      reportInStatus: ReportInStatus.REJECTED,
      reason: 'ไม่มารายงานตัวตามกำหนด',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('does not require reason when reportInStatus is CONFIRMED', async () => {
    const dto = plainToInstance(UpdateReportInDto, {
      reportInStatus: ReportInStatus.CONFIRMED,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid reportInStatus value', async () => {
    const dto = plainToInstance(UpdateReportInDto, {
      reportInStatus: 'NOT_A_REAL_STATUS',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reportInStatus')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `backend/`): `npm test -- update-exam.dto.spec.ts update-report-in.dto.spec.ts`
Expected: FAIL — `Cannot find module './update-exam.dto'` / `'./update-report-in.dto'`

- [ ] **Step 3: Write the DTOs**

`backend/src/modules/applicant/dto/update-exam.dto.ts`:
```ts
import { IsEnum } from 'class-validator';
import { ExamResult } from '@prisma/client';

export class UpdateExamDto {
  @IsEnum(ExamResult)
  examResult: ExamResult;
}
```

`backend/src/modules/applicant/dto/update-report-in.dto.ts`:
```ts
import { IsEnum, IsString, IsNotEmpty, ValidateIf } from 'class-validator';
import { ReportInStatus } from '@prisma/client';

export class UpdateReportInDto {
  @IsEnum(ReportInStatus)
  reportInStatus: ReportInStatus;

  @ValidateIf((o: UpdateReportInDto) => o.reportInStatus === ReportInStatus.REJECTED)
  @IsString()
  @IsNotEmpty()
  reason?: string;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- update-exam.dto.spec.ts update-report-in.dto.spec.ts`
Expected: PASS, 8 tests total (4 + 4)

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/applicant/dto/update-exam.dto.ts backend/src/modules/applicant/dto/update-exam.dto.spec.ts backend/src/modules/applicant/dto/update-report-in.dto.ts backend/src/modules/applicant/dto/update-report-in.dto.spec.ts
git commit -m "feat(applicant): add exam result and report-in DTOs"
```

---

### Task 3: Backend service — `updateExamResult` and `updateReportIn`

**Files:**
- Modify: `backend/src/modules/applicant/applicant.service.ts:1-27` (imports/constructor — no signature change) and add two new methods after `updateStatus` (currently ends at line 342)
- Modify: `backend/src/modules/applicant/applicant.service.spec.ts` (append new `describe` blocks)

**Interfaces:**
- Consumes: `UpdateExamDto`, `UpdateReportInDto` from Task 2; `ApplicantService` constructor is unchanged: `constructor(prisma: PrismaService, uploadService: UploadService, turnstileService: TurnstileService)`.
- Produces: `ApplicantService.updateExamResult(id: string, examResult: ExamResult): Promise<Applicant>` and `ApplicantService.updateReportIn(id: string, reportInStatus: ReportInStatus, reason?: string): Promise<Applicant>` — consumed by the controller in Task 4.

- [ ] **Step 1: Write the failing service tests**

Open `backend/src/modules/applicant/applicant.service.spec.ts`. Change the top import line from:
```ts
import { ApplicationStatus } from '@prisma/client';
```
to:
```ts
import { ApplicationStatus, ExamResult, ReportInStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
```

Then append these `describe` blocks at the end of the file (after the existing `describe('ApplicantService.updateStatus', ...)` block, still inside the same file, same imports of `ApplicantService`, `PrismaService`, `UploadService`, `TurnstileService`, `UpdateArgs`, `UpdateMock` already at the top):

```ts
describe('ApplicantService.updateExamResult', () => {
  const buildService = (applicant: { status: ApplicationStatus }, update: UpdateMock) => {
    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue(applicant),
        update,
      },
    } as unknown as PrismaService;
    return new ApplicantService(prisma, {} as UploadService, {} as TurnstileService);
  };

  it('rejects setting an exam result before the applicant is APPROVED', async () => {
    const update: UpdateMock = jest.fn();
    const service = buildService({ status: ApplicationStatus.REVIEWING }, update);

    await expect(service.updateExamResult('1', ExamResult.PASSED)).rejects.toThrow(
      BadRequestException,
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('sets examResult once the applicant is APPROVED', async () => {
    const update: UpdateMock = jest
      .fn<Promise<unknown>, [UpdateArgs]>()
      .mockResolvedValue({});
    const service = buildService({ status: ApplicationStatus.APPROVED }, update);

    await service.updateExamResult('1', ExamResult.PASSED);

    expect(update.mock.calls[0][0].data.examResult).toBe(ExamResult.PASSED);
  });
});

describe('ApplicantService.updateReportIn', () => {
  const buildService = (applicant: { examResult: ExamResult }, update: UpdateMock) => {
    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue(applicant),
        update,
      },
    } as unknown as PrismaService;
    return new ApplicantService(prisma, {} as UploadService, {} as TurnstileService);
  };

  it('rejects updating report-in status before the exam is passed', async () => {
    const update: UpdateMock = jest.fn();
    const service = buildService({ examResult: ExamResult.NOT_YET }, update);

    await expect(
      service.updateReportIn('1', ReportInStatus.CONFIRMED),
    ).rejects.toThrow(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });

  it('stores reportInReason when rejecting the report-in', async () => {
    const update: UpdateMock = jest
      .fn<Promise<unknown>, [UpdateArgs]>()
      .mockResolvedValue({});
    const service = buildService({ examResult: ExamResult.PASSED }, update);

    await service.updateReportIn('1', ReportInStatus.REJECTED, 'ไม่มารายงานตัวตามกำหนด');

    const dataArg = update.mock.calls[0][0].data;
    expect(dataArg.reportInStatus).toBe(ReportInStatus.REJECTED);
    expect(dataArg.reportInReason).toBe('ไม่มารายงานตัวตามกำหนด');
    expect(dataArg.reportInAt).toBeInstanceOf(Date);
  });

  it('does not store reportInReason when confirming the report-in', async () => {
    const update: UpdateMock = jest
      .fn<Promise<unknown>, [UpdateArgs]>()
      .mockResolvedValue({});
    const service = buildService({ examResult: ExamResult.PASSED }, update);

    await service.updateReportIn('1', ReportInStatus.CONFIRMED);

    expect(update.mock.calls[0][0].data.reportInReason).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- applicant.service.spec.ts`
Expected: FAIL — `service.updateExamResult is not a function` / `service.updateReportIn is not a function`

- [ ] **Step 3: Add the two methods**

In `backend/src/modules/applicant/applicant.service.ts`, add `ExamResult, ReportInStatus` to the existing Prisma import:
```ts
import { Prisma, DocumentType, ApplicationStatus, ExamResult, ReportInStatus } from '@prisma/client';
```

Then add these two methods directly after the existing `updateStatus` method (which ends with the closing `}` right before `/** * Get all applicants for export ... */`, around line 342):

```ts
  /**
   * Set exam result (admin) — only allowed once the applicant is APPROVED
   */
  async updateExamResult(id: string, examResult: ExamResult) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    if (applicant.status !== ApplicationStatus.APPROVED) {
      throw new BadRequestException(
        'Applicant must be APPROVED before setting an exam result',
      );
    }

    return this.prisma.applicant.update({
      where: { id },
      data: { examResult },
      include: {
        program: {
          select: { name: true, faculty: { select: { name: true } } },
        },
      },
    });
  }

  /**
   * Approve or reject report-in (admin) — only allowed once the exam is PASSED
   */
  async updateReportIn(id: string, reportInStatus: ReportInStatus, reason?: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    if (applicant.examResult !== ExamResult.PASSED) {
      throw new BadRequestException(
        'Applicant must pass the exam before report-in can be updated',
      );
    }

    return this.prisma.applicant.update({
      where: { id },
      data: {
        reportInStatus,
        reportInAt: new Date(),
        ...(reportInStatus === ReportInStatus.REJECTED
          ? { reportInReason: reason }
          : {}),
      },
      include: {
        program: {
          select: { name: true, faculty: { select: { name: true } } },
        },
      },
    });
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- applicant.service.spec.ts`
Expected: PASS, 6 tests total (2 existing + 4 new)

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/applicant/applicant.service.ts backend/src/modules/applicant/applicant.service.spec.ts
git commit -m "feat(applicant): add updateExamResult and updateReportIn service methods"
```

---

### Task 4: Backend controller — exam & report-in endpoints

**Files:**
- Modify: `backend/src/modules/applicant/applicant.controller.ts:1-90`

**Interfaces:**
- Consumes: `UpdateExamDto`, `UpdateReportInDto` (Task 2), `ApplicantService.updateExamResult`/`updateReportIn` (Task 3).
- Produces: `PATCH admin/applicants/:id/exam`, `PATCH admin/applicants/:id/report-in` — consumed by the frontend service functions in Task 5.

- [ ] **Step 1: Add the DTO imports**

At the top of `backend/src/modules/applicant/applicant.controller.ts`, after the existing `import { UpdateStatusDto } from './dto/update-status.dto';` line, add:
```ts
import { UpdateExamDto } from './dto/update-exam.dto';
import { UpdateReportInDto } from './dto/update-report-in.dto';
```

- [ ] **Step 2: Add the two endpoints**

Directly after the existing `updateStatus` method (the last method in the class, right before the final closing `}`), add:
```ts

  /**
   * Set exam result
   */
  @Patch('admin/applicants/:id/exam')
  @UseGuards(JwtAuthGuard)
  async updateExam(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.applicantService.updateExamResult(id, dto.examResult);
  }

  /**
   * Approve or reject report-in
   */
  @Patch('admin/applicants/:id/report-in')
  @UseGuards(JwtAuthGuard)
  async updateReportIn(@Param('id') id: string, @Body() dto: UpdateReportInDto) {
    return this.applicantService.updateReportIn(id, dto.reportInStatus, dto.reason);
  }
```

- [ ] **Step 3: Manual verification**

Run (from `backend/`): `npm run start:dev`
In another terminal, log in as an admin to get the auth cookie via the existing login flow, then, using that session:
- `PATCH /api/admin/applicants/:id/exam` with `{"examResult":"PASSED"}` on an applicant whose `status` is not `APPROVED` → expect HTTP 400.
- Same request on an applicant whose `status` is `APPROVED` → expect HTTP 200 with `examResult: "PASSED"` in the response body.

Expected: both responses match. Stop the dev server after checking (`Ctrl+C`).

- [ ] **Step 4: Commit**

```bash
git add backend/src/modules/applicant/applicant.controller.ts
git commit -m "feat(applicant): expose exam result and report-in endpoints"
```

---

### Task 5: Frontend types & API service functions

**Files:**
- Modify: `frontend/src/types/index.ts:61-109` (the `Applicant` interface)
- Modify: `frontend/src/services/applicant.service.ts:1-25`

**Interfaces:**
- Consumes: nothing new.
- Produces: types `ExamResult`, `ReportInStatus`; `Applicant.examResult`, `Applicant.reportInStatus`, `Applicant.reportInReason?`, `Applicant.reportInAt?`; functions `updateApplicantExamApi(id, examResult)`, `updateApplicantReportInApi(id, reportInStatus, reason?)` — consumed by the hooks in Task 6.

- [ ] **Step 1: Add the types**

In `frontend/src/types/index.ts`, right before `export interface Applicant {` (line 61), add:
```ts
export type ExamResult = 'NOT_YET' | 'PASSED' | 'FAILED';
export type ReportInStatus = 'NOT_YET' | 'CONFIRMED' | 'REJECTED';

```

Then, inside `Applicant`, right after the existing `status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';` line, add:
```ts
  examResult: ExamResult;
  reportInStatus: ReportInStatus;
  reportInReason?: string;
  reportInAt?: string;
```

- [ ] **Step 2: Add the API functions**

In `frontend/src/services/applicant.service.ts`, right after the existing `updateApplicantStatusApi` function, add:
```ts
/**
 * ADMIN: PATCH /admin/applicants/:id/exam - บันทึกผลสอบ
 */
export const updateApplicantExamApi = async (id: string, examResult: string): Promise<[Promise<ApiResponse<Applicant>>, AbortFunction]> => {
  return callAPI<ApiResponse<Applicant>>("PATCH", `/admin/applicants/${id}/exam`, { examResult });
};

/**
 * ADMIN: PATCH /admin/applicants/:id/report-in - อนุมัติ/ปฏิเสธการรายงานตัว
 */
export const updateApplicantReportInApi = async (id: string, reportInStatus: string, reason?: string): Promise<[Promise<ApiResponse<Applicant>>, AbortFunction]> => {
  return callAPI<ApiResponse<Applicant>>("PATCH", `/admin/applicants/${id}/report-in`, { reportInStatus, reason });
};
```

- [ ] **Step 3: Manual verification**

Run (from `frontend/`): `npx tsc --noEmit`
Expected: no new type errors (pre-existing errors, if any, are unrelated and unchanged).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/index.ts frontend/src/services/applicant.service.ts
git commit -m "feat(applicant): add exam/report-in types and API service functions"
```

---

### Task 6: Frontend mutation hooks

**Files:**
- Modify: `frontend/src/modules/applicants/hooks/use-applicants.ts:1-81`

**Interfaces:**
- Consumes: `updateApplicantExamApi`, `updateApplicantReportInApi` from Task 5.
- Produces: `useApplicantMutation()` now also returns `updateExam` and `updateReportIn` mutation objects — consumed by `ApplicantDetailModal.tsx` in Task 8.

- [ ] **Step 1: Update the import line**

Change:
```ts
import { listApplicantsApi, updateApplicantStatusApi, exportApplicantsApi, getApplicantApi } from "@/services/applicant.service";
```
to:
```ts
import { listApplicantsApi, updateApplicantStatusApi, exportApplicantsApi, getApplicantApi, updateApplicantExamApi, updateApplicantReportInApi } from "@/services/applicant.service";
```

- [ ] **Step 2: Add the two mutations**

Inside `useApplicantMutation`, directly after the existing `updateStatus` mutation (right before `const exportData = useMutation({`), add:
```ts
  const updateExam = useMutation({
    mutationFn: async ({ id, examResult }: { id: string, examResult: string }) => {
      const [promise] = await updateApplicantExamApi(id, examResult);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["applicant"] });
      toast.success("บันทึกผลสอบสำเร็จ");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถบันทึกผลสอบได้"));
    }
  });

  const updateReportIn = useMutation({
    mutationFn: async ({ id, reportInStatus, reason }: { id: string, reportInStatus: string, reason?: string }) => {
      const [promise] = await updateApplicantReportInApi(id, reportInStatus, reason);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["applicant"] });
      toast.success("บันทึกการรายงานตัวสำเร็จ");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "ไม่สามารถบันทึกการรายงานตัวได้"));
    }
  });
```

Then update the `return` statement at the bottom of `useApplicantMutation` from:
```ts
  return {
    updateStatus,
    exportData
  };
```
to:
```ts
  return {
    updateStatus,
    updateExam,
    updateReportIn,
    exportData
  };
```

- [ ] **Step 3: Manual verification**

Run (from `frontend/`): `npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modules/applicants/hooks/use-applicants.ts
git commit -m "feat(applicant): add updateExam and updateReportIn mutation hooks"
```

---

### Task 7: Frontend table — exam result column

**Files:**
- Modify: `frontend/src/modules/applicants/components/ApplicantTable.tsx:26-146`

**Interfaces:**
- Consumes: `Applicant.examResult` from Task 5.
- Produces: nothing new (visual only).

- [ ] **Step 1: Add the table header**

In the `<thead>` block, right after:
```tsx
              <th className="px-6 py-5 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">สถานะ</th>
```
add:
```tsx
              <th className="px-6 py-5 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">ผลสอบ</th>
```

- [ ] **Step 2: Add the loading-skeleton cell**

In the loading `<tr>` block, right after:
```tsx
                <td className="px-6 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
```
(the one that follows the phone-number skeleton and precedes the "จัดการ" skeleton), add another identical line:
```tsx
                <td className="px-6 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
```
(There will now be two consecutive skeleton badge cells: one for สถานะ, one for ผลสอบ.)

- [ ] **Step 3: Add the data cell**

In the data row, right after the closing `</td>` of the สถานะ cell (the block that renders the `app.status` badge, ending right before the "จัดการ" `<td>`), add:
```tsx
                <td className="px-6 py-6">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider ${
                    app.examResult === 'PASSED' ? 'bg-emerald-100 text-emerald-600' :
                    app.examResult === 'FAILED' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {app.examResult === 'PASSED' ? 'สอบผ่าน' : app.examResult === 'FAILED' ? 'สอบไม่ผ่าน' : 'รอสอบ'}
                  </div>
                </td>
```

- [ ] **Step 4: Manual verification**

Run (from `frontend/`): `npm run dev`, open `/admin/applicants`, confirm a new "ผลสอบ" column renders with a gray "รอสอบ" badge for every row (no applicant has a non-default exam result yet), and the loading skeleton shows two badge placeholders per row while data is fetching.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/applicants/components/ApplicantTable.tsx
git commit -m "feat(applicant): show exam result column in the applicants table"
```

---

### Task 8: Frontend modal — exam & report-in actions

**Files:**
- Modify: `frontend/src/modules/applicants/components/ApplicantDetailModal.tsx`

**Interfaces:**
- Consumes: `useApplicantMutation().updateExam` / `.updateReportIn` from Task 6; `Applicant.examResult` / `.reportInStatus` / `.reportInReason` from Task 5.
- Produces: nothing new (UI only).

- [ ] **Step 1: Add label/style maps**

Right after the existing `STATUS_STYLES` constant (ends around line 46), add:
```ts
const EXAM_RESULT_LABELS: Record<Applicant['examResult'], string> = {
  NOT_YET: 'รอสอบ',
  PASSED: 'สอบผ่าน',
  FAILED: 'สอบไม่ผ่าน',
};

const EXAM_RESULT_STYLES: Record<Applicant['examResult'], string> = {
  NOT_YET: 'bg-gray-100 text-gray-500',
  PASSED: 'bg-emerald-100 text-emerald-600',
  FAILED: 'bg-red-100 text-red-600',
};

const REPORT_IN_LABELS: Record<Applicant['reportInStatus'], string> = {
  NOT_YET: 'ยังไม่รายงานตัว',
  CONFIRMED: 'รายงานตัวแล้ว',
  REJECTED: 'ปฏิเสธรายงานตัว',
};

const REPORT_IN_STYLES: Record<Applicant['reportInStatus'], string> = {
  NOT_YET: 'bg-gray-100 text-gray-500',
  CONFIRMED: 'bg-emerald-100 text-emerald-600',
  REJECTED: 'bg-red-100 text-red-600',
};
```

- [ ] **Step 2: Add local state and handlers**

Change:
```ts
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { data: res, isLoading } = useApplicant(applicantId);
  const { updateStatus } = useApplicantMutation();
```
to:
```ts
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [reportInRejecting, setReportInRejecting] = useState(false);
  const [reportInReason, setReportInReason] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { data: res, isLoading } = useApplicant(applicantId);
  const { updateStatus, updateExam, updateReportIn } = useApplicantMutation();
```

Change:
```ts
  const handleClose = () => {
    setRejecting(false);
    setReason('');
    onClose();
  };
```
to:
```ts
  const handleClose = () => {
    setRejecting(false);
    setReason('');
    setReportInRejecting(false);
    setReportInReason('');
    onClose();
  };
```

Right after the existing `handleConfirmReject` function, add:
```ts
  const handleSetExamResult = (examResult: 'PASSED' | 'FAILED') => {
    updateExam.mutate({ id: applicantId, examResult });
  };

  const handleConfirmReportIn = () => {
    updateReportIn.mutate({ id: applicantId, reportInStatus: 'CONFIRMED' }, { onSuccess: handleClose });
  };

  const handleConfirmReportInReject = () => {
    updateReportIn.mutate(
      { id: applicantId, reportInStatus: 'REJECTED', reason: reportInReason },
      { onSuccess: handleClose },
    );
  };
```

- [ ] **Step 3: Add the exam/report-in info section**

Right after the closing `</Section>` of the `"สถานะและการยินยอม"` section (ends around line 263, right before the `เอกสารแนบ` `<div>` block), add:
```tsx
            <Section title="ผลสอบและการรายงานตัว">
              <div>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">ผลสอบ</p>
                <div className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-[12px] font-black uppercase tracking-wider ${EXAM_RESULT_STYLES[applicant.examResult]}`}>
                  {EXAM_RESULT_LABELS[applicant.examResult]}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">รายงานตัว</p>
                <div className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-[12px] font-black uppercase tracking-wider ${REPORT_IN_STYLES[applicant.reportInStatus]}`}>
                  {REPORT_IN_LABELS[applicant.reportInStatus]}
                </div>
              </div>
              {applicant.reportInStatus === 'REJECTED' && applicant.reportInReason && (
                <InfoRow label="เหตุผลที่ปฏิเสธรายงานตัว" value={applicant.reportInReason} />
              )}
            </Section>
```

- [ ] **Step 4: Add the report-in rejection reason textarea**

Right after the existing `{rejecting && (...)}` textarea block (ends around line 301, right before the closing `</div>` of the `space-y-8` wrapper), add:
```tsx
            {reportInRejecting && (
              <div>
                <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">เหตุผลที่ปฏิเสธการรายงานตัว</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                  rows={3}
                  value={reportInReason}
                  onChange={(e) => setReportInReason(e.target.value)}
                  placeholder="เช่น ไม่มารายงานตัวตามกำหนด"
                />
              </div>
            )}
```

- [ ] **Step 5: Add the footer action buttons**

Right after the existing `{applicant?.status === 'REVIEWING' && ( ... )}` block in the footer (ends right before the final two closing `</div>` tags of the component, around line 481), add:
```tsx
          {applicant?.status === 'APPROVED' && applicant.examResult === 'NOT_YET' && (
            <div className="flex gap-3">
              <button
                type="button"
                disabled={updateExam.isPending}
                onClick={() => handleSetExamResult('FAILED')}
                className="py-3 px-5 rounded-2xl border-2 border-red-100 text-red-500 font-black hover:bg-red-50 transition-all text-sm uppercase tracking-widest"
              >
                สอบไม่ผ่าน
              </button>
              <button
                type="button"
                disabled={updateExam.isPending}
                onClick={() => handleSetExamResult('PASSED')}
                className="py-3 px-5 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 disabled:opacity-40 shadow-xl shadow-emerald-500/20 transition-all text-sm uppercase tracking-widest"
              >
                สอบผ่าน
              </button>
            </div>
          )}

          {applicant?.examResult === 'PASSED' && applicant.reportInStatus === 'NOT_YET' && (
            reportInRejecting ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setReportInRejecting(false); setReportInReason(''); }}
                  className="py-3 px-5 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={!reportInReason.trim() || updateReportIn.isPending}
                  onClick={handleConfirmReportInReject}
                  className="py-3 px-5 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-red-500/20 transition-all text-sm uppercase tracking-widest"
                >
                  ยืนยันปฏิเสธรายงานตัว
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={updateReportIn.isPending}
                  onClick={() => setReportInRejecting(true)}
                  className="py-3 px-5 rounded-2xl border-2 border-red-100 text-red-500 font-black hover:bg-red-50 transition-all text-sm uppercase tracking-widest"
                >
                  ปฏิเสธรายงานตัว
                </button>
                <button
                  type="button"
                  disabled={updateReportIn.isPending}
                  onClick={handleConfirmReportIn}
                  className="py-3 px-5 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 disabled:opacity-40 shadow-xl shadow-emerald-500/20 transition-all text-sm uppercase tracking-widest"
                >
                  อนุมัติรายงานตัว
                </button>
              </div>
            )
          )}
```

- [ ] **Step 6: Manual verification**

Run (from `frontend/`): `npm run dev`, open `/admin/applicants`.
- Open an `APPROVED` applicant's detail modal → confirm "สอบผ่าน"/"สอบไม่ผ่าน" buttons appear, clicking "สอบผ่าน" updates the badge in the "ผลสอบและการรายงานตัว" section and closes/reopens correctly (query invalidation refreshes the modal).
- Reopen that same applicant (now `examResult: PASSED`) → confirm "อนุมัติรายงานตัว"/"ปฏิเสธรายงานตัว" buttons appear; clicking "ปฏิเสธรายงานตัว" shows the reason textarea and the confirm button stays disabled until text is entered.
- Open a `PENDING`/`REVIEWING` applicant → confirm neither the exam nor report-in buttons render.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/modules/applicants/components/ApplicantDetailModal.tsx
git commit -m "feat(applicant): add exam result and report-in actions to the detail modal"
```

---

### Task 9: Frontend — program card selector on the applicants page

**Files:**
- Create: `frontend/src/modules/applicants/components/ProgramCardGrid.tsx`
- Modify: `frontend/src/modules/applicants/views/ApplicantsView.tsx`

**Interfaces:**
- Consumes: `usePrograms()` from `frontend/src/modules/admin-programs/hooks/use-programs.ts` (existing, returns `{ data: ApiResponse<Program[]>, isLoading }`).
- Produces: nothing consumed by later tasks — this is the last task in Part A.

- [ ] **Step 1: Create the card grid component**

`frontend/src/modules/applicants/components/ProgramCardGrid.tsx`:
```tsx
'use client';

import React from 'react';
import { GraduationCap, Users, LayoutGrid } from 'lucide-react';
import { Program } from '@/types';
import { PremiumCard } from '@/components/ui/PremiumBase';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProgramCardGridProps {
  programs: Program[];
  loading: boolean;
  onSelect: (programId: string | null) => void;
}

export const ProgramCardGrid: React.FC<ProgramCardGridProps> = ({ programs, loading, onSelect }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border-2 border-gray-50/50 space-y-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <button type="button" onClick={() => onSelect(null)} className="text-left">
        <PremiumCard className="p-6 h-full hover:border-brand/30 cursor-pointer transition-colors">
          <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center mb-4">
            <LayoutGrid size={18} className="text-navy" />
          </div>
          <p className="text-sm font-black text-navy">ทั้งหมด</p>
          <p className="text-[12px] text-gray-400 font-bold mt-0.5">ทุกสาขาวิชา</p>
        </PremiumCard>
      </button>
      {programs.map((program) => (
        <button key={program.id} type="button" onClick={() => onSelect(program.id)} className="text-left">
          <PremiumCard className="p-6 h-full hover:border-brand/30 cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center mb-4">
              <GraduationCap size={18} className="text-brand" />
            </div>
            <p className="text-sm font-black text-navy truncate">{program.name}</p>
            <p className="text-[12px] text-gray-400 font-bold mt-0.5 truncate">{program.faculty?.name}</p>
            <div className="flex items-center gap-1 mt-3 text-[12px] font-bold text-gray-400">
              <Users size={12} />
              {program.currentApplicants} คน
            </div>
          </PremiumCard>
        </button>
      ))}
    </div>
  );
};
```

- [ ] **Step 2: Wire it into `ApplicantsView.tsx`**

Update the imports at the top of `frontend/src/modules/applicants/views/ApplicantsView.tsx`:
```tsx
'use client';

import React, { useState } from 'react';
import { Search, Download, Printer, ArrowLeft } from 'lucide-react';
import { useApplicants, useApplicantMutation } from '../hooks/use-applicants';
import { usePrograms } from '@/modules/admin-programs/hooks/use-programs';
import { ApplicantTable } from '../components/ApplicantTable';
import { ApplicantDetailModal } from '../components/ApplicantDetailModal';
import { ProgramCardGrid } from '../components/ProgramCardGrid';
import { PremiumButton, PremiumCard } from '../../../components/ui/PremiumBase';
import { PremiumInput, PremiumSelect } from '../../../components/ui/FormControls';
```

Change the `filters` state to include `programId`:
```tsx
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    year: new Date().getFullYear() + 543,
    programId: '',
  });
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [viewingApplicantId, setViewingApplicantId] = useState<string | null>(null);

  const { data: programsRes, isLoading: programsLoading } = usePrograms();
  const programs = programsRes?.data || [];
```
(Insert this right after the existing `viewingApplicantId` line and before `const { data: res, isLoading } = useApplicants(filters);`.)

Add the selection handler right after `handleSearchChange`:
```tsx
  const handleSelectProgram = (programId: string | null) => {
    setSelectedProgramId(programId ?? '');
    setFilters(prev => ({ ...prev, programId: programId ?? '', page: 1 }));
  };
```

Finally, wrap the filter bar + table (everything from the `{/* Filters Bar */}` comment through the closing `<ApplicantTable ... />` tag) in a conditional, and render `ProgramCardGrid` when no program is selected yet. Replace:
```tsx
      {/* Filters Bar */}
      <PremiumCard className="p-2 flex flex-wrap items-center gap-3 border-gray-100/50">
```
with:
```tsx
      {selectedProgramId === null ? (
        <ProgramCardGrid programs={programs} loading={programsLoading} onSelect={handleSelectProgram} />
      ) : (
      <>
      <button
        type="button"
        onClick={() => setSelectedProgramId(null)}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-navy transition-colors"
      >
        <ArrowLeft size={16} />
        กลับไปเลือกสาขา
      </button>

      {/* Filters Bar */}
      <PremiumCard className="p-2 flex flex-wrap items-center gap-3 border-gray-100/50">
```

And right after the closing `<ApplicantTable ... />` tag (before the `<ApplicantDetailModal`), close the new conditional:
```tsx
      </>
      )}
```

- [ ] **Step 3: Manual verification**

Run (from `frontend/`): `npm run dev`, open `/admin/applicants`.
- Confirm a grid of cards renders first: "ทั้งหมด" plus one card per program (name, faculty, applicant count).
- Click a program card → confirm the card grid is replaced by the "← กลับไปเลือกสาขา" link, the filter bar, and a table showing only that program's applicants.
- Click "← กลับไปเลือกสาขา" → confirm it returns to the card grid.
- Click "ทั้งหมด" → confirm the table shows applicants from every program.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modules/applicants/components/ProgramCardGrid.tsx frontend/src/modules/applicants/views/ApplicantsView.tsx
git commit -m "feat(applicant): browse applicants by program via a card selector"
```

---

## Part B — Dashboard by year, report-in stat card, 3-year data retention

### Task 10: Backend dashboard — year param & report-in count

**Files:**
- Modify: `backend/src/modules/dashboard/dashboard.controller.ts:1-15`
- Modify: `backend/src/modules/dashboard/dashboard.service.ts:1-111`
- Create: `backend/src/modules/dashboard/dashboard.service.spec.ts`

**Interfaces:**
- Consumes: `Applicant.reportInStatus` (Task 1).
- Produces: `DashboardService.getStats(year?: number)` returns `overview.reportedInCount` and `overview.currentYear` now reflects the requested/selected year — consumed by the frontend in Task 13.

- [ ] **Step 1: Write the failing service test**

`backend/src/modules/dashboard/dashboard.service.spec.ts`:
```ts
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DashboardService.getStats', () => {
  const buildService = (count: jest.Mock) => {
    const prisma = {
      applicant: {
        count,
        groupBy: jest.fn().mockResolvedValue([]),
        findMany: jest.fn().mockResolvedValue([]),
      },
      program: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
    } as unknown as PrismaService;
    return new DashboardService(prisma);
  };

  it('scopes counts to the requested year and counts confirmed report-ins', async () => {
    const count = jest
      .fn()
      .mockImplementation((args?: { where?: Record<string, unknown> }) => {
        if (!args) return Promise.resolve(999); // all-time total (no where clause)
        if (args.where?.reportInStatus === 'CONFIRMED') return Promise.resolve(7);
        return Promise.resolve(42);
      });
    const service = buildService(count);

    const stats = await service.getStats(2567);

    expect(stats.overview.currentYear).toBe(2567);
    expect(stats.overview.thisYearApplicants).toBe(42);
    expect(stats.overview.reportedInCount).toBe(7);
    expect(count).toHaveBeenCalledWith({
      where: { applicationYear: 2567, reportInStatus: 'CONFIRMED' },
    });
  });

  it('defaults to the current Buddhist-era year when no year is given', async () => {
    const count = jest.fn().mockResolvedValue(0);
    const service = buildService(count);

    const stats = await service.getStats();

    const expectedYear = new Date().getFullYear() + 543;
    expect(stats.overview.currentYear).toBe(expectedYear);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run (from `backend/`): `npm test -- dashboard.service.spec.ts`
Expected: FAIL — `stats.overview.reportedInCount` is `undefined` (property does not exist yet)

- [ ] **Step 3: Update the controller**

`backend/src/modules/dashboard/dashboard.controller.ts`, full replacement:
```ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/admin/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getStats(@Query('year') year?: string) {
    return this.dashboardService.getStats(year ? Number(year) : undefined);
  }
}
```

- [ ] **Step 4: Update the service**

In `backend/src/modules/dashboard/dashboard.service.ts`, replace the `getStats` method signature and body from:
```ts
  async getStats() {
    const currentYear = new Date().getFullYear() + 543;

    const [
      totalApplicants,
      thisYearApplicants,
      statusCounts,
      programCounts,
      genderCounts,
      monthlyTrend,
      recentApplicants,
    ] = await Promise.all([
      // Total all-time
      this.prisma.applicant.count(),

      // This year
      this.prisma.applicant.count({
        where: { applicationYear: currentYear },
      }),

      // By status (this year)
      this.prisma.applicant.groupBy({
        by: ['status'],
        where: { applicationYear: currentYear },
        _count: { id: true },
      }),

      // By program (this year)
      this.prisma.applicant.groupBy({
        by: ['programId'],
        where: { applicationYear: currentYear },
        _count: { id: true },
      }),

      // By gender (this year)
      this.prisma.applicant.groupBy({
        by: ['gender'],
        where: { applicationYear: currentYear },
        _count: { id: true },
      }),

      // Monthly trend (this year)
      this.prisma.$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM submitted_at) as month,
          COUNT(*)::int as count
        FROM applicants
        WHERE application_year = ${currentYear}
        GROUP BY EXTRACT(MONTH FROM submitted_at)
        ORDER BY month
      `,

      // Recent 5 applicants
      this.prisma.applicant.findMany({
        where: { applicationYear: currentYear },
        orderBy: { submittedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          prefixName: true,
          firstName: true,
          lastName: true,
          applicationNumber: true,
          status: true,
          submittedAt: true,
          program: { select: { name: true } },
        },
      }),
    ]);
```
to:
```ts
  async getStats(year?: number) {
    const currentYear = new Date().getFullYear() + 543;
    const targetYear = year ?? currentYear;

    const [
      totalApplicants,
      thisYearApplicants,
      reportedInCount,
      statusCounts,
      programCounts,
      genderCounts,
      monthlyTrend,
      recentApplicants,
    ] = await Promise.all([
      // Total all-time
      this.prisma.applicant.count(),

      // Selected year
      this.prisma.applicant.count({
        where: { applicationYear: targetYear },
      }),

      // Confirmed report-ins (selected year)
      this.prisma.applicant.count({
        where: { applicationYear: targetYear, reportInStatus: 'CONFIRMED' },
      }),

      // By status (selected year)
      this.prisma.applicant.groupBy({
        by: ['status'],
        where: { applicationYear: targetYear },
        _count: { id: true },
      }),

      // By program (selected year)
      this.prisma.applicant.groupBy({
        by: ['programId'],
        where: { applicationYear: targetYear },
        _count: { id: true },
      }),

      // By gender (selected year)
      this.prisma.applicant.groupBy({
        by: ['gender'],
        where: { applicationYear: targetYear },
        _count: { id: true },
      }),

      // Monthly trend (selected year)
      this.prisma.$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM submitted_at) as month,
          COUNT(*)::int as count
        FROM applicants
        WHERE application_year = ${targetYear}
        GROUP BY EXTRACT(MONTH FROM submitted_at)
        ORDER BY month
      `,

      // Recent 5 applicants (selected year)
      this.prisma.applicant.findMany({
        where: { applicationYear: targetYear },
        orderBy: { submittedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          prefixName: true,
          firstName: true,
          lastName: true,
          applicationNumber: true,
          status: true,
          submittedAt: true,
          program: { select: { name: true } },
        },
      }),
    ]);
```

Then update the `return` statement at the bottom of `getStats` from:
```ts
    return {
      overview: {
        totalApplicants,
        thisYearApplicants,
        currentYear,
      },
```
to:
```ts
    return {
      overview: {
        totalApplicants,
        thisYearApplicants,
        currentYear: targetYear,
        reportedInCount,
      },
```
(The rest of the `return` block — `statusBreakdown`, `programBreakdown`, `genderBreakdown`, `monthlyTrend`, `recentApplicants` — is unchanged.)

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- dashboard.service.spec.ts`
Expected: PASS, 2 tests

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/dashboard/dashboard.controller.ts backend/src/modules/dashboard/dashboard.service.ts backend/src/modules/dashboard/dashboard.service.spec.ts
git commit -m "feat(dashboard): scope stats to a selected year and add report-in count"
```

---

### Task 11: Backend — 3-year retention purge (delete logic)

**Files:**
- Modify: `backend/src/modules/applicant/applicant.service.ts` (add `deletePurgeYear`, append to the existing `applicant.service.spec.ts`)

**Interfaces:**
- Consumes: `UploadService.deleteFile(key: string): Promise<void>` (existing, `backend/src/modules/upload/upload.service.ts:93`).
- Produces: `ApplicantService.deletePurgeYear(year: number): Promise<number>` (throws `BadRequestException` if `year` is within the 3-year retention window) — consumed by `ExportController` in Task 12.

- [ ] **Step 1: Write the failing tests**

Append to `backend/src/modules/applicant/applicant.service.spec.ts` (after the `describe('ApplicantService.updateReportIn', ...)` block added in Task 3):
```ts
describe('ApplicantService.deletePurgeYear', () => {
  it('rejects purging a year within the 3-year retention window', async () => {
    const currentYear = new Date().getFullYear() + 543;
    const prisma = {} as PrismaService;
    const service = new ApplicantService(prisma, {} as UploadService, {} as TurnstileService);

    await expect(service.deletePurgeYear(currentYear - 2)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deletes storage files and applicant rows for an eligible year', async () => {
    const currentYear = new Date().getFullYear() + 543;
    const purgeYear = currentYear - 3;
    const findMany = jest.fn().mockResolvedValue([
      { id: 'a1', documents: [{ storageKey: 'applicants/a1/photo.jpg' }] },
    ]);
    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const deleteFile = jest.fn().mockResolvedValue(undefined);
    const prisma = {
      applicant: { findMany, deleteMany },
    } as unknown as PrismaService;
    const uploadService = { deleteFile } as unknown as UploadService;
    const service = new ApplicantService(prisma, uploadService, {} as TurnstileService);

    const count = await service.deletePurgeYear(purgeYear);

    expect(deleteFile).toHaveBeenCalledWith('applicants/a1/photo.jpg');
    expect(deleteMany).toHaveBeenCalledWith({ where: { applicationYear: purgeYear } });
    expect(count).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `backend/`): `npm test -- applicant.service.spec.ts`
Expected: FAIL — `service.deletePurgeYear is not a function`

- [ ] **Step 3: Implement `deletePurgeYear`**

In `backend/src/modules/applicant/applicant.service.ts`, add this method directly after `updateReportIn` (added in Task 3):
```ts
  /**
   * Export-then-delete data retention purge (admin, SUPER_ADMIN only).
   * Keeps the current year and the 2 preceding years; only years older
   * than that (year <= currentYear - 3) are eligible.
   */
  async deletePurgeYear(year: number): Promise<number> {
    const currentYear = new Date().getFullYear() + 543;
    if (year > currentYear - 3) {
      throw new BadRequestException(
        'This year is not old enough to purge — the last 3 years must be kept',
      );
    }

    const applicants = await this.prisma.applicant.findMany({
      where: { applicationYear: year },
      include: { documents: true },
    });

    for (const applicant of applicants) {
      for (const doc of applicant.documents) {
        await this.uploadService.deleteFile(doc.storageKey);
      }
    }

    const result = await this.prisma.applicant.deleteMany({
      where: { applicationYear: year },
    });

    this.logger.log(`Purged ${result.count} applicants for year ${year}`);
    return result.count;
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- applicant.service.spec.ts`
Expected: PASS, 8 tests total (2 updateStatus + 2 updateExamResult + 2 updateReportIn + 2 deletePurgeYear)

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/applicant/applicant.service.ts backend/src/modules/applicant/applicant.service.spec.ts
git commit -m "feat(applicant): add 3-year data retention purge (delete storage + rows)"
```

---

### Task 12: Backend — purge endpoint (export-then-delete, SUPER_ADMIN only)

**Files:**
- Create: `backend/src/modules/export/dto/purge.dto.ts`
- Create: `backend/src/modules/export/dto/purge.dto.spec.ts`
- Modify: `backend/src/modules/export/export.controller.ts:1-51`

**Interfaces:**
- Consumes: `ExportService.exportExcel(query)` (existing, `backend/src/modules/export/export.service.ts:22`), `ApplicantService.deletePurgeYear` (Task 11). `ApplicantService` is already available to `ExportModule` — `ExportModule` imports `ApplicantModule`, which exports `ApplicantService` (`backend/src/modules/applicant/applicant.module.ts:10`).
- Produces: `POST admin/export/purge` — consumed by the frontend in Task 15.

- [ ] **Step 1: Write the failing DTO test**

`backend/src/modules/export/dto/purge.dto.spec.ts`:
```ts
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PurgeDto } from './purge.dto';

describe('PurgeDto', () => {
  it('accepts a valid year', async () => {
    const dto = plainToInstance(PurgeDto, { year: 2567 });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing year', async () => {
    const dto = plainToInstance(PurgeDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'year')).toBe(true);
  });

  it('rejects a year below 2500', async () => {
    const dto = plainToInstance(PurgeDto, { year: 100 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'year')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `backend/`): `npm test -- purge.dto.spec.ts`
Expected: FAIL — `Cannot find module './purge.dto'`

- [ ] **Step 3: Write the DTO**

`backend/src/modules/export/dto/purge.dto.ts`:
```ts
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PurgeDto {
  @IsInt()
  @Min(2500)
  @Type(() => Number)
  year: number;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- purge.dto.spec.ts`
Expected: PASS, 3 tests

- [ ] **Step 5: Add the purge endpoint**

In `backend/src/modules/export/export.controller.ts`, update the imports from:
```ts
import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StatusFilterDto } from '../applicant/dto/query-applicant.dto';
```
to:
```ts
import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { ApplicantService } from '../applicant/applicant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StatusFilterDto } from '../applicant/dto/query-applicant.dto';
import { PurgeDto } from './dto/purge.dto';
```

Change the constructor from:
```ts
  constructor(private readonly exportService: ExportService) {}
```
to:
```ts
  constructor(
    private readonly exportService: ExportService,
    private readonly applicantService: ApplicantService,
  ) {}
```

Add the new endpoint at the end of the class, right after the existing `exportPdf` method:
```ts

  /**
   * SUPER_ADMIN only: export a year's applicants to Excel, then delete
   * them (and their storage files). Only years older than the 3-year
   * retention window are eligible — enforced in ApplicantService.
   */
  @Post('purge')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async purge(@Body() body: PurgeDto, @Res() res: Response) {
    const buffer = await this.exportService.exportExcel({ year: body.year });
    await this.applicantService.deletePurgeYear(body.year);

    const filename = `applicants_purged_${body.year}_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });
    res.send(buffer);
  }
```

- [ ] **Step 6: Manual verification**

Run (from `backend/`): `npm run start:dev`. Using an authenticated `STAFF` session, `POST /api/admin/export/purge` with `{"year": 2400}` → expect HTTP 403 (role guard blocks non-`SUPER_ADMIN`). Using a `SUPER_ADMIN` session, same request with a year inside the retention window (e.g. current year) → expect HTTP 400 from `deletePurgeYear`'s guard. With a year outside the window on a test/seed applicant → expect an `.xlsx` file download and the applicant gone from `GET admin/applicants?year=<that year>`. Stop the dev server after checking.

- [ ] **Step 7: Commit**

```bash
git add backend/src/modules/export/dto/purge.dto.ts backend/src/modules/export/dto/purge.dto.spec.ts backend/src/modules/export/export.controller.ts
git commit -m "feat(export): add SUPER_ADMIN-only export-then-delete purge endpoint"
```

---

### Task 13: Frontend — dashboard service & hook accept a year

**Files:**
- Modify: `frontend/src/services/dashboard.service.ts:1-23`
- Modify: `frontend/src/modules/dashboard/hooks/use-dashboard.ts:1-14`

**Interfaces:**
- Consumes: nothing new.
- Produces: `fetchDashboardStatsApi(year?: number)`, `useDashboardStats(year?: number)`, `DashboardStats.overview.reportedInCount: number` — consumed by `DashboardView.tsx` in Task 14.

- [ ] **Step 1: Update the service**

`frontend/src/services/dashboard.service.ts`, full replacement:
```ts
import { callAPI, AbortFunction } from "@/lib/call-api";
import { ApiResponse } from "@/types";
import { Applicant } from "./applicant.service";

export interface DashboardStats {
  overview: {
    totalApplicants: number;
    thisYearApplicants: number;
    currentYear: number;
    reportedInCount: number;
  };
  statusBreakdown: Array<{ status: string; count: number }>;
  programBreakdown: Array<{ programName: string; count: number }>;
  monthlyTrend: Array<{ month: number; count: number }>;
  recentApplicants: Applicant[];
}

/**
 * ADMIN: GET /admin/dashboard - สถิติภาพรวม (แยกตามปี)
 */
export const fetchDashboardStatsApi = async (year?: number): Promise<[Promise<ApiResponse<DashboardStats>>, AbortFunction]> => {
  return callAPI<ApiResponse<DashboardStats>>("GET", "/admin/dashboard", null, { params: year ? { year } : undefined });
};
```

- [ ] **Step 2: Update the hook**

`frontend/src/modules/dashboard/hooks/use-dashboard.ts`, full replacement:
```ts
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStatsApi } from "@/services/dashboard.service";

export const useDashboardStats = (year?: number) => {
  return useQuery({
    queryKey: ["admin-dashboard-stats", year],
    queryFn: async () => {
      const [promise] = await fetchDashboardStatsApi(year);
      return promise;
    },
    refetchInterval: 5 * 60 * 1000, // อัปเดตทุก 5 นาที
  });
};
```

- [ ] **Step 3: Manual verification**

Run (from `frontend/`): `npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services/dashboard.service.ts frontend/src/modules/dashboard/hooks/use-dashboard.ts
git commit -m "feat(dashboard): pass a selected year through to the stats API"
```

---

### Task 14: Frontend — dashboard year dropdown & report-in stat card

**Files:**
- Modify: `frontend/src/modules/dashboard/views/DashboardView.tsx`
- Modify: `frontend/src/modules/dashboard/components/StatsOverview.tsx`

**Interfaces:**
- Consumes: `useDashboardStats(year)` (Task 13), `DashboardStats.overview.reportedInCount` (Task 13).
- Produces: nothing new (UI only).

- [ ] **Step 1: Add the year dropdown to `DashboardView.tsx`**

Update the imports from:
```tsx
'use client';

import React from 'react';
import { CalendarDays, Award, BookOpen, Users, Clock } from 'lucide-react';
import { useDashboardStats } from '../hooks/use-dashboard';
import { StatsOverview } from '../components/StatsOverview';
import { TrendChart } from '../components/TrendChart';
import { Skeleton } from '@/components/ui/Skeleton';
```
to:
```tsx
'use client';

import React, { useState } from 'react';
import { CalendarDays, Award, BookOpen, Users, Clock } from 'lucide-react';
import { useDashboardStats } from '../hooks/use-dashboard';
import { StatsOverview } from '../components/StatsOverview';
import { TrendChart } from '../components/TrendChart';
import { Skeleton } from '@/components/ui/Skeleton';
import { PremiumSelect } from '@/components/ui/FormControls';
```

Change:
```tsx
export const DashboardView = () => {
  const { data: res, isLoading } = useDashboardStats();
  const stats = res?.data;
```
to:
```tsx
export const DashboardView = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + 543);
  const { data: res, isLoading } = useDashboardStats(selectedYear);
  const stats = res?.data;
```

Replace the header-right block:
```tsx
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-gray-100 shadow-sm text-[13px] font-bold text-gray-400">
          <CalendarDays size={14} className="text-brand" />
          ปีการศึกษา {stats?.overview?.currentYear}
          <span className="text-gray-200 mx-1">|</span>
          <Clock size={12} className="text-gray-300" />
          อัปเดต {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
        </div>
```
with:
```tsx
        <div className="flex items-center gap-3">
          <div className="w-44">
            <PremiumSelect
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              options={[0, 1, 2].map(i => {
                const year = new Date().getFullYear() + 543 - i;
                return { label: `ปีการศึกษา ${year}`, value: year };
              })}
            />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-xl border border-gray-100 shadow-sm text-[13px] font-bold text-gray-400">
            <Clock size={12} className="text-gray-300" />
            อัปเดต {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
          </div>
        </div>
```

`CalendarDays` is no longer used in this file after this change — remove it from the lucide-react import line so it becomes:
```tsx
import { Award, BookOpen, Users, Clock } from 'lucide-react';
```

- [ ] **Step 2: Add the 5th stat card**

In `frontend/src/modules/dashboard/components/StatsOverview.tsx`, update the import from:
```tsx
import { Users, UserPlus, FileClock, UserCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
```
to:
```tsx
import { Users, UserPlus, FileClock, UserCheck, GraduationCap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
```

Add a 5th entry to the `overviewCards` array, right after the existing "อนุมัติแล้ว" card:
```ts
    { 
      title: 'รายงานตัวแล้ว', 
      value: stats?.overview?.reportedInCount || 0, 
      icon: GraduationCap, 
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
      trend: null,
      subtitle: 'ยืนยันเข้าเรียนแล้ว'
    },
```

Change the grid wrapper class from:
```tsx
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
```
to:
```tsx
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
```

- [ ] **Step 3: Manual verification**

Run (from `frontend/`): `npm run dev`, open `/admin/dashboard`.
- Confirm 5 stat cards render, including "รายงานตัวแล้ว" (0 until Part A produces confirmed report-ins).
- Confirm the year dropdown shows the current year and the two preceding years; switching it refetches stats and updates every card, the trend chart, and "หลักสูตรยอดนิยม".

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modules/dashboard/views/DashboardView.tsx frontend/src/modules/dashboard/components/StatsOverview.tsx
git commit -m "feat(dashboard): add year selector and report-in stat card"
```

---

### Task 15: Frontend — purge API function

**Files:**
- Modify: `frontend/src/services/applicant.service.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `purgeApplicantsApi(year: number): Promise<[Promise<Blob>, AbortFunction]>` — consumed by `SettingsView.tsx` in Task 16.

- [ ] **Step 1: Add the function**

In `frontend/src/services/applicant.service.ts`, right after the existing `exportApplicantsApi` function, add:
```ts
/**
 * ADMIN (SUPER_ADMIN only): POST /admin/export/purge - export ปีเก่า แล้วลบออกจากระบบ
 */
export const purgeApplicantsApi = async (year: number): Promise<[Promise<Blob>, AbortFunction]> => {
  return callAPI<Blob>("POST", "/admin/export/purge", { year }, { responseType: 'blob' });
};
```

- [ ] **Step 2: Manual verification**

Run (from `frontend/`): `npx tsc --noEmit`
Expected: no new type errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/applicant.service.ts
git commit -m "feat(applicant): add purge API service function"
```

---

### Task 16: Frontend — data retention section on the Settings page

**Files:**
- Modify: `frontend/src/modules/settings/views/SettingsView.tsx`

**Interfaces:**
- Consumes: `purgeApplicantsApi` (Task 15), `useAuth()` (existing, `frontend/src/modules/auth/hooks/use-auth.ts`, returns `{ user }` where `user.role` is `'SUPER_ADMIN' | 'STAFF'`).
- Produces: nothing new — last task in Part B.

- [ ] **Step 1: Update imports**

Change:
```tsx
'use client';

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { ExtraCompactInput } from '@/modules/auth/components/ExtraCompactInput';
import { changePasswordApi, ChangePasswordPayload } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/call-api';
```
to:
```tsx
'use client';

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KeyRound, Lock, ShieldCheck, Trash2 } from 'lucide-react';
import { ExtraCompactInput } from '@/modules/auth/components/ExtraCompactInput';
import { PremiumSelect } from '@/components/ui/FormControls';
import { changePasswordApi, ChangePasswordPayload } from '@/services/auth.service';
import { purgeApplicantsApi } from '@/services/applicant.service';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { getErrorMessage } from '@/lib/call-api';
```

- [ ] **Step 2: Add state, mutation, and handler**

Change:
```tsx
export const SettingsView = () => {
  const changePasswordMutation = useMutation({
```
to:
```tsx
export const SettingsView = () => {
  const { user } = useAuth();
  const [purgeYear, setPurgeYear] = useState(new Date().getFullYear() + 543 - 3);

  const purgeMutation = useMutation({
    mutationFn: async (year: number) => {
      const [promise] = await purgeApplicantsApi(year);
      const blob = await promise;

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `applicants_purged_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    },
    onSuccess: () => {
      toast.success('ส่งออกและลบข้อมูลเก่าสำเร็จ');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'ไม่สามารถลบข้อมูลเก่าได้'));
    },
  });

  const handlePurge = () => {
    const confirmed = window.confirm(
      `ต้องการลบข้อมูลผู้สมัครปีการศึกษา ${purgeYear} อย่างถาวรใช่หรือไม่?\nระบบจะดาวน์โหลดไฟล์ Excel สำรองให้ก่อนลบ การกระทำนี้ไม่สามารถย้อนกลับได้`,
    );
    if (!confirmed) return;
    purgeMutation.mutate(purgeYear);
  };

  const changePasswordMutation = useMutation({
```

- [ ] **Step 3: Add the section to the JSX**

Right after the closing `</div>` of the existing password-change `<div className="max-w-md ...">` block (the last element before the final closing `</div>` of the component), add:
```tsx
      {user?.role === 'SUPER_ADMIN' && (
        <div className="max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-red-50 text-red-500">
              <Trash2 size={16} />
            </div>
            <h2 className="text-sm font-black text-navy uppercase tracking-wider">จัดการข้อมูลเก่า</h2>
          </div>
          <p className="text-xs text-gray-400 font-bold mb-4">
            ระบบเก็บข้อมูลผู้สมัคร 3 ปีล่าสุด ปีที่เก่ากว่านั้นสามารถ export เป็น Excel แล้วลบออกจากระบบได้
          </p>
          <PremiumSelect
            label="ปีที่ต้องการลบ"
            value={purgeYear}
            onChange={(e) => setPurgeYear(Number(e.target.value))}
            options={Array.from({ length: 5 }).map((_, i) => {
              const year = new Date().getFullYear() + 543 - 3 - i;
              return { label: `ปีการศึกษา ${year}`, value: year };
            })}
          />
          <button
            type="button"
            disabled={purgeMutation.isPending}
            onClick={handlePurge}
            className="w-full mt-4 py-3.5 bg-red-500 text-white rounded-xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {purgeMutation.isPending ? 'กำลังดำเนินการ...' : `Export และลบข้อมูลปี ${purgeYear}`}
          </button>
        </div>
      )}
```

- [ ] **Step 4: Manual verification**

Run (from `frontend/`): `npm run dev`, open `/admin/settings`.
- Logged in as `STAFF` → confirm the "จัดการข้อมูลเก่า" section does not render.
- Logged in as `SUPER_ADMIN` → confirm it renders with a year dropdown (defaulting to `currentYear - 3`) offering 5 eligible years, and clicking the button shows a native confirm dialog before doing anything.
- Confirming with a year that has seed/test applicant data → confirm an `.xlsx` file downloads and a success toast appears.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/settings/views/SettingsView.tsx
git commit -m "feat(settings): add SUPER_ADMIN-only data retention purge UI"
```

---

## Self-Review Notes

**Spec coverage:**
- ผลสอบ badge on table + modal → Tasks 7, 8. ✅
- อนุมัติรายงานตัว in modal → Task 8. ✅
- Program filter/cards → Task 9. ✅
- Dashboard per-year + report-in card → Tasks 10, 13, 14. ✅
- 3-year retention, export-first delete, SUPER_ADMIN gated, manual+confirm → Tasks 11, 12, 16. ✅
- Applicant table year filter → already implemented pre-plan (spec §3.3); no task needed.

**Type consistency check:** `examResult`/`reportInStatus` string literal unions match between backend Prisma enums (Task 1), frontend `types/index.ts` (Task 5), and every consumer (Tasks 6-9, 14). `deletePurgeYear` return type (`Promise<number>`) matches its only caller in Task 12. `getStats(year?: number)` signature matches its only caller (`DashboardController.getStats`, Task 10) and the frontend's `fetchDashboardStatsApi(year?: number)` (Task 13).

**No placeholders:** every step above contains complete, runnable code — no TBD/TODO markers.
