# Applicant Review Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the broken applicant "view" button in `/admin/applicants` and replace the 3 fixed row buttons (Approve/Reject/Eye) with one status-driven action button that opens a detail dialog, from which admins review submitted data, open attached documents, and approve/reject.

**Architecture:** Backend already has a working `GET /admin/applicants/:id` (returns full applicant + signed document URLs) and `PATCH /admin/applicants/:id/status`. This plan hardens the status-update endpoint (enum validation + required rejection reason) and adds the entire frontend piece: API client function, query hook, a new `ApplicantDetailModal` component (plain-div dialog, matching the existing `ProgramModal` pattern — no dialog library in this codebase), and wiring in the table/view.

**Tech Stack:** NestJS + Prisma + class-validator (backend), Next.js + TanStack Query + Tailwind + lucide-react, no component library (frontend).

## Global Constraints

- No new dependencies — everything here uses stdlib, Prisma, class-validator, and TanStack Query, all already installed.
- Follow the existing plain-div dialog pattern (`ProgramModal.tsx`) — no portal/dialog library.
- Follow the existing `onEdit`/`onDelete`-style callback-prop pattern for table row actions (`ProgramTable.tsx`) — the table receives handlers as props, it doesn't own modal state.
- Thai UI copy exactly as specified: "ตรวจสอบ", "ดูรายละเอียด", "อนุมัติผ่าน", "ไม่ผ่าน", "ปิด".
- `ApplicationStatus` enum (backend, `@prisma/client`) and the frontend status union in `frontend/src/types/index.ts:73` are the single source of truth — do not introduce another divergent copy.

---

### Task 1: Backend — add `rejectionReason` column

**Files:**
- Modify: `backend/prisma/schema.prisma:106-109` (Applicant model, Timestamps block)

**Interfaces:**
- Produces: `Applicant.rejectionReason: string | null` field, available to Prisma Client as `rejectionReason` on all applicant queries/updates from Task 3 onward.

- [ ] **Step 1: Add the field to the schema**

In `backend/prisma/schema.prisma`, in the `Applicant` model, change:

```prisma
  // Timestamps
  submittedAt DateTime  @default(now()) @map("submitted_at")
  reviewedAt  DateTime? @map("reviewed_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
```

to:

```prisma
  // Timestamps
  submittedAt DateTime  @default(now()) @map("submitted_at")
  reviewedAt  DateTime? @map("reviewed_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Review outcome
  rejectionReason String? @map("rejection_reason") @db.Text
```

- [ ] **Step 2: Generate and apply the migration**

Run from `backend/`:

```bash
npx prisma migrate dev --name add_applicant_rejection_reason
```

Expected: creates a new folder under `backend/prisma/migrations/` and prints `Your database is now in sync with your schema.` The Prisma Client is regenerated automatically (this is what makes `rejectionReason` show up on the `Applicant` type used in Task 3).

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat: add rejectionReason column to Applicant"
```

---

### Task 2: Backend — `UpdateStatusDto` with conditional reason validation

**Files:**
- Create: `backend/src/modules/applicant/dto/update-status.dto.ts`
- Test: `backend/src/modules/applicant/dto/update-status.dto.spec.ts`

**Interfaces:**
- Consumes: `ApplicationStatus` enum from `@prisma/client` (already used the same way in `backend/src/modules/applicant/applicant.service.ts:9`).
- Produces: `UpdateStatusDto` class with `status: ApplicationStatus` and `reason?: string`, for Task 3's controller to consume via `@Body()`.

- [ ] **Step 1: Write the failing test**

Create `backend/src/modules/applicant/dto/update-status.dto.spec.ts`:

```typescript
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApplicationStatus } from '@prisma/client';
import { UpdateStatusDto } from './update-status.dto';

describe('UpdateStatusDto', () => {
  it('requires a non-empty reason when status is REJECTED', async () => {
    const dto = plainToInstance(UpdateStatusDto, { status: ApplicationStatus.REJECTED });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reason')).toBe(true);
  });

  it('passes when status is REJECTED and reason is provided', async () => {
    const dto = plainToInstance(UpdateStatusDto, {
      status: ApplicationStatus.REJECTED,
      reason: 'เอกสารไม่ครบถ้วน',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('does not require reason for other statuses', async () => {
    const dto = plainToInstance(UpdateStatusDto, { status: ApplicationStatus.APPROVED });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid status value', async () => {
    const dto = plainToInstance(UpdateStatusDto, { status: 'NOT_A_REAL_STATUS' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `backend/`: `npx jest src/modules/applicant/dto/update-status.dto.spec.ts`
Expected: FAIL — `Cannot find module './update-status.dto'`

- [ ] **Step 3: Write the DTO**

Create `backend/src/modules/applicant/dto/update-status.dto.ts`:

```typescript
import { IsEnum, IsString, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ValidateIf((o: UpdateStatusDto) => o.status === ApplicationStatus.REJECTED)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reason?: string;
}
```

Note: `@IsOptional()` combined with `@ValidateIf` keeps `reason` untyped-optional for every other status while still enforcing it for `REJECTED` — `@ValidateIf` gates whether the other decorators run at all, `@IsOptional()` only matters for statuses where the block is skipped so `undefined`/missing never triggers a "must be a string" error there.

- [ ] **Step 4: Run test to verify it passes**

Run from `backend/`: `npx jest src/modules/applicant/dto/update-status.dto.spec.ts`
Expected: PASS, 4 tests

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/applicant/dto/update-status.dto.ts backend/src/modules/applicant/dto/update-status.dto.spec.ts
git commit -m "feat: add UpdateStatusDto with conditional rejection-reason validation"
```

---

### Task 3: Backend — wire `UpdateStatusDto` into controller + service

**Files:**
- Modify: `backend/src/modules/applicant/applicant.controller.ts:84-88`
- Modify: `backend/src/modules/applicant/applicant.service.ts:306-325`

**Interfaces:**
- Consumes: `UpdateStatusDto` from Task 2.
- Produces: `ApplicantService.updateStatus(id: string, status: ApplicationStatus, reason?: string)` — signature change from the current `updateStatus(id: string, status: string)`.

- [ ] **Step 1: Update the controller**

In `backend/src/modules/applicant/applicant.controller.ts`, add the import:

```typescript
import { UpdateStatusDto } from './dto/update-status.dto';
```

Replace:

```typescript
  /**
   * Update applicant status
   */
  @Patch('admin/applicants/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.applicantService.updateStatus(id, status);
  }
```

with:

```typescript
  /**
   * Update applicant status
   */
  @Patch('admin/applicants/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.applicantService.updateStatus(id, dto.status, dto.reason);
  }
```

- [ ] **Step 2: Update the service**

In `backend/src/modules/applicant/applicant.service.ts`, replace:

```typescript
  /**
   * Update applicant status (admin)
   */
  async updateStatus(id: string, status: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.applicant.update({
      where: { id },
      data: {
        status: status as ApplicationStatus,
        reviewedAt: new Date(),
      },
      include: {
        program: { select: { name: true, faculty: true } },
      },
    });
  }
```

with:

```typescript
  /**
   * Update applicant status (admin)
   */
  async updateStatus(id: string, status: ApplicationStatus, reason?: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.applicant.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        ...(status === 'REJECTED' ? { rejectionReason: reason } : {}),
      },
      include: {
        program: { select: { name: true, faculty: true } },
      },
    });
  }
```

- [ ] **Step 3: Type-check**

Run from `backend/`: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run from `backend/`: `npm run start:dev`, then with an existing applicant id and a valid admin session cookie:

```bash
curl -X PATCH http://localhost:4000/api/admin/applicants/<id>/status \
  -H "Content-Type: application/json" -b "<cookie>" \
  -d '{"status":"REJECTED"}'
```

Expected: HTTP 400, validation error mentioning `reason`. Then repeat with `{"status":"REJECTED","reason":"เอกสารไม่ครบถ้วน"}` — expected: HTTP 200, response body's `data.status` is `"REJECTED"`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/applicant/applicant.controller.ts backend/src/modules/applicant/applicant.service.ts
git commit -m "feat: validate status updates via UpdateStatusDto, persist rejection reason"
```

---

### Task 4: Frontend — extend the shared `Applicant` type, add `ApplicantDocument`

**Files:**
- Modify: `frontend/src/types/index.ts:37-77`

**Interfaces:**
- Produces: `ApplicantDocument` interface and an extended `Applicant` interface (adds `parentName`, `parentPhone`, `parentRelation`, `pdpaConsent`, `consentedAt`, `reviewedAt`, `rejectionReason`, `documents`), consumed by Tasks 5, 8, 9.

- [ ] **Step 1: Add `ApplicantDocument` and extend `Applicant`**

In `frontend/src/types/index.ts`, insert before the `Applicant` interface:

```typescript
export interface ApplicantDocument {
  id: string;
  type: 'PHOTO' | 'ID_CARD' | 'HOUSE_REGISTRATION' | 'TRANSCRIPT' | 'CERTIFICATE' | 'NAME_CHANGE' | 'OTHER';
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
}
```

Then, inside the existing `Applicant` interface, change:

```typescript
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  applicationNumber: string;
  applicationYear: number;
  submittedAt: string;
}
```

to:

```typescript
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  applicationNumber: string;
  applicationYear: number;
  submittedAt: string;
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
  pdpaConsent: boolean;
  consentedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documents?: ApplicantDocument[];
}
```

- [ ] **Step 2: Type-check**

Run from `frontend/`: `npx tsc --noEmit`
Expected: no new errors (existing usages of `Applicant` only read fields that still exist, all new fields are optional or additive).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat: extend Applicant type with review/document fields"
```

---

### Task 5: Frontend — fix `applicant.service.ts`, add `getApplicantApi`

**Files:**
- Modify: `frontend/src/services/applicant.service.ts`

**Interfaces:**
- Consumes: `Applicant` from `@/types` (Task 4).
- Produces: `getApplicantApi(id: string): Promise<[Promise<ApiResponse<Applicant>>, AbortFunction]>`, `updateApplicantStatusApi(id: string, status: string, reason?: string)`, consumed by Task 6.

- [ ] **Step 1: Replace the divergent local `Applicant` interface with the shared type**

In `frontend/src/services/applicant.service.ts`, replace:

```typescript
import { callAPI, AbortFunction } from "@/lib/call-api";
import { ApiResponse, Pagination } from "@/types";

export interface Applicant {
  id: string;
  applicationNumber: string;
  prefixName: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DOCUMENT_REJECTED';
  program?: {
    name: string;
    faculty: string;
  };
  createdAt: string;
}
```

with:

```typescript
import { callAPI, AbortFunction } from "@/lib/call-api";
import { ApiResponse, Pagination, Applicant } from "@/types";

export type { Applicant };
```

(`export type { Applicant }` keeps every existing `import { Applicant } from '@/services/applicant.service'` in the codebase working with zero call-site changes, now pointing at the single correct type from Task 4.)

- [ ] **Step 2: Add `getApplicantApi` and extend the status update function**

Replace:

```typescript
/**
 * ADMIN: PATCH /admin/applicants/:id/status - อัปเดตสถานะ
 */
export const updateApplicantStatusApi = async (id: string, status: string): Promise<[Promise<ApiResponse<Applicant>>, AbortFunction]> => {
  return callAPI<ApiResponse<Applicant>>("PATCH", `/admin/applicants/${id}/status`, { status });
};
```

with:

```typescript
/**
 * ADMIN: GET /admin/applicants/:id - รายละเอียดผู้สมัคร
 */
export const getApplicantApi = async (id: string): Promise<[Promise<ApiResponse<Applicant>>, AbortFunction]> => {
  return callAPI<ApiResponse<Applicant>>("GET", `/admin/applicants/${id}`);
};

/**
 * ADMIN: PATCH /admin/applicants/:id/status - อัปเดตสถานะ
 */
export const updateApplicantStatusApi = async (id: string, status: string, reason?: string): Promise<[Promise<ApiResponse<Applicant>>, AbortFunction]> => {
  return callAPI<ApiResponse<Applicant>>("PATCH", `/admin/applicants/${id}/status`, { status, reason });
};
```

- [ ] **Step 3: Type-check**

Run from `frontend/`: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services/applicant.service.ts
git commit -m "fix: use shared Applicant type, add getApplicantApi"
```

---

### Task 6: Frontend — `useApplicant` query hook, `reason` in the mutation

**Files:**
- Modify: `frontend/src/modules/applicants/hooks/use-applicants.ts`

**Interfaces:**
- Consumes: `getApplicantApi`, `updateApplicantStatusApi` from Task 5.
- Produces: `useApplicant(id: string | null)` query hook and `updateStatus.mutate({ id, status, reason? })`, consumed by Task 8 (modal) and Task 7/9 (table/view, unchanged call shape since `reason` is optional).

- [ ] **Step 1: Add the import and the hook**

In `frontend/src/modules/applicants/hooks/use-applicants.ts`, replace the import line:

```typescript
import { listApplicantsApi, updateApplicantStatusApi, exportApplicantsApi } from "@/services/applicant.service";
```

with:

```typescript
import { listApplicantsApi, updateApplicantStatusApi, exportApplicantsApi, getApplicantApi } from "@/services/applicant.service";
```

Then add, after `useApplicants`:

```typescript
export const useApplicant = (id: string | null) => {
  return useQuery({
    queryKey: ["applicant", id],
    queryFn: async () => {
      const [promise] = await getApplicantApi(id as string);
      return promise;
    },
    enabled: !!id,
  });
};
```

- [ ] **Step 2: Accept `reason` in the status mutation**

Replace:

```typescript
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const [promise] = await updateApplicantStatusApi(id, status);
      return promise;
    },
```

with:

```typescript
  const updateStatus = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string, status: string, reason?: string }) => {
      const [promise] = await updateApplicantStatusApi(id, status, reason);
      return promise;
    },
```

- [ ] **Step 3: Type-check**

Run from `frontend/`: `npx tsc --noEmit`
Expected: no errors — existing 2-arg callers (`updateStatus.mutate({ id, status })`) still satisfy the type since `reason` is optional.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modules/applicants/hooks/use-applicants.ts
git commit -m "feat: add useApplicant query hook, thread rejection reason through mutation"
```

---

### Task 7: Frontend — dynamic action button + full status badges in `ApplicantTable`

**Files:**
- Modify: `frontend/src/modules/applicants/components/ApplicantTable.tsx`

**Interfaces:**
- Consumes: `Applicant` from `@/types` (via `@/services/applicant.service` re-export, Task 5).
- Produces: `ApplicantTable` now takes an `onView: (id: string) => void` prop (in addition to the existing `onUpdateStatus`), consumed by Task 9.

- [ ] **Step 1: Update imports and props**

Replace:

```typescript
import React from 'react';
import { Clock, CheckCircle2, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Applicant } from '@/services/applicant.service';
import { Pagination } from '@/types';

interface ApplicantTableProps {
  applicants: Applicant[];
  pagination: Partial<Pagination>;
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
}

export const ApplicantTable: React.FC<ApplicantTableProps> = ({ 
  applicants, pagination, loading, onUpdateStatus, onPageChange, currentPage 
}) => {
```

with:

```typescript
import React from 'react';
import { Clock, CheckCircle2, XCircle, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Applicant } from '@/services/applicant.service';
import { Pagination } from '@/types';

interface ApplicantTableProps {
  applicants: Applicant[];
  pagination: Partial<Pagination>;
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => void;
  onView: (id: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
}

export const ApplicantTable: React.FC<ApplicantTableProps> = ({ 
  applicants, pagination, loading, onUpdateStatus, onView, onPageChange, currentPage 
}) => {
```

- [ ] **Step 2: Add REVIEWING/CANCELLED to the status badge**

Replace:

```typescript
                <td className="px-6 py-6">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    app.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                    app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {app.status === 'PENDING' && <Clock size={12} />}
                    {app.status === 'APPROVED' && <CheckCircle2 size={12} />}
                    {app.status === 'REJECTED' && <XCircle size={12} />}
                    {app.status === 'PENDING' ? 'รอตรวจสอบ' : 
                     app.status === 'APPROVED' ? 'เบื้องต้นผ่าน' :
                     app.status === 'REJECTED' ? 'ไม่ผ่าน' : app.status}
                  </div>
                </td>
```

with:

```typescript
                <td className="px-6 py-6">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    app.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                    app.status === 'REVIEWING' ? 'bg-blue-100 text-blue-600' :
                    app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {app.status === 'PENDING' && <Clock size={12} />}
                    {app.status === 'REVIEWING' && <Eye size={12} />}
                    {app.status === 'APPROVED' && <CheckCircle2 size={12} />}
                    {app.status === 'REJECTED' && <XCircle size={12} />}
                    {app.status === 'PENDING' ? 'รอตรวจสอบ' : 
                     app.status === 'REVIEWING' ? 'กำลังตรวจสอบ' :
                     app.status === 'APPROVED' ? 'เบื้องต้นผ่าน' :
                     app.status === 'REJECTED' ? 'ไม่ผ่าน' :
                     app.status === 'CANCELLED' ? 'ยกเลิก' : app.status}
                  </div>
                </td>
```

- [ ] **Step 3: Replace the 3 fixed buttons with one dynamic button**

Replace:

```typescript
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onUpdateStatus(app.id, 'APPROVED')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="อนุมัติ">
                      <CheckCircle2 size={18} />
                    </button>
                    <button onClick={() => onUpdateStatus(app.id, 'REJECTED')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ไม่อนุมัติ">
                      <XCircle size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
```

with:

```typescript
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end">
                    {app.status === 'PENDING' ? (
                      <button
                        onClick={() => { onUpdateStatus(app.id, 'REVIEWING'); onView(app.id); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-xs font-black"
                      >
                        <Search size={16} />
                        ตรวจสอบ
                      </button>
                    ) : (
                      <button
                        onClick={() => onView(app.id)}
                        className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-xs font-black"
                      >
                        <Eye size={16} />
                        ดูรายละเอียด
                      </button>
                    )}
                  </div>
                </td>
```

- [ ] **Step 4: Type-check**

Run from `frontend/`: `npx tsc --noEmit`
Expected: fails until Task 9 passes `onView` — that's expected at this point in the sequence; if executing tasks out of order, stub `onView={() => {}}` temporarily wherever `ApplicantTable` is rendered. If executing in order (Task 9 comes after), skip this check for now and just confirm no *other* type errors appear (e.g. `npx tsc --noEmit` will report exactly one error, in `ApplicantsView.tsx`, about the missing `onView` prop — that's expected).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/applicants/components/ApplicantTable.tsx
git commit -m "feat: replace fixed row actions with one status-driven button"
```

---

### Task 8: Frontend — `ApplicantDetailModal` component

**Files:**
- Create: `frontend/src/modules/applicants/components/ApplicantDetailModal.tsx`

**Interfaces:**
- Consumes: `useApplicant`, `useApplicantMutation` from `../hooks/use-applicants` (Task 6); `Applicant`, `ApplicantDocument` from `@/types` (Task 4).
- Produces: `ApplicantDetailModal` component with props `{ applicantId: string | null; onClose: () => void }`, consumed by Task 9.

- [ ] **Step 1: Write the component**

Create `frontend/src/modules/applicants/components/ApplicantDetailModal.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import { XCircle, FileText, ExternalLink } from 'lucide-react';
import { useApplicant, useApplicantMutation } from '../hooks/use-applicants';
import { ApplicantDocument } from '@/types';

interface ApplicantDetailModalProps {
  applicantId: string | null;
  onClose: () => void;
}

const DOCUMENT_LABELS: Record<ApplicantDocument['type'], string> = {
  PHOTO: 'รูปถ่าย',
  ID_CARD: 'บัตรประชาชน / ใบสุทธิ',
  HOUSE_REGISTRATION: 'ทะเบียนบ้าน',
  TRANSCRIPT: 'วุฒิการศึกษา / Transcript',
  CERTIFICATE: 'ใบรับรอง',
  NAME_CHANGE: 'ใบเปลี่ยนชื่อ-นามสกุล',
  OTHER: 'เอกสารอื่นๆ',
};

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-bold text-navy mt-0.5">{value || '-'}</p>
  </div>
);

export const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({ applicantId, onClose }) => {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const { data: res, isLoading } = useApplicant(applicantId);
  const { updateStatus } = useApplicantMutation();
  const applicant = res?.data;

  if (!applicantId) return null;

  const handleClose = () => {
    setRejecting(false);
    setReason('');
    onClose();
  };

  const handleApprove = () => {
    updateStatus.mutate({ id: applicantId, status: 'APPROVED' }, { onSuccess: handleClose });
  };

  const handleConfirmReject = () => {
    updateStatus.mutate(
      { id: applicantId, status: 'REJECTED', reason },
      { onSuccess: handleClose },
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-8 sm:p-10 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-navy tracking-tight">รายละเอียดผู้สมัคร</h3>
          <button onClick={handleClose} className="p-2 text-gray-300 hover:bg-gray-100 rounded-full transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        {isLoading || !applicant ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold text-brand uppercase tracking-[0.2em]">{applicant.applicationNumber}</p>
              <h4 className="text-xl font-black text-navy">{applicant.prefixName}{applicant.firstName} {applicant.lastName}</h4>
              <p className="text-sm font-bold text-gray-500">{applicant.program?.name}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5">
              <InfoRow label="เลขบัตรประชาชน" value={applicant.nationalId} />
              <InfoRow label="เพศ" value={applicant.gender} />
              <InfoRow label="วันเกิด" value={new Date(applicant.birthDate).toLocaleDateString('th-TH')} />
              <InfoRow label="เบอร์โทรศัพท์" value={applicant.phone} />
              <InfoRow label="อีเมล" value={applicant.email} />
              <InfoRow label="LINE ID" value={applicant.lineId} />
              <InfoRow label="ที่อยู่" value={`${applicant.address} ต.${applicant.subDistrict} อ.${applicant.district} จ.${applicant.province} ${applicant.postalCode}`} />
              <InfoRow label="โรงเรียนเดิม" value={applicant.previousSchool} />
              <InfoRow label="วุฒิการศึกษาเดิม" value={applicant.previousEducation} />
              <InfoRow label="เกรดเฉลี่ย" value={applicant.gpa} />
              <InfoRow label="ผู้ปกครอง" value={applicant.parentName} />
              <InfoRow label="เบอร์โทรผู้ปกครอง" value={applicant.parentPhone} />
              <InfoRow label="เหตุผลการสมัคร" value={applicant.applicationReason} />
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">เอกสารแนบ</p>
              <div className="space-y-2">
                {(applicant.documents || []).map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-100 p-3 rounded-xl transition-colors"
                  >
                    <span className="flex items-center gap-2.5 text-sm font-bold text-navy">
                      <FileText size={16} className="text-gray-400" />
                      {DOCUMENT_LABELS[doc.type]}
                    </span>
                    <ExternalLink size={14} className="text-gray-400" />
                  </a>
                ))}
                {(!applicant.documents || applicant.documents.length === 0) && (
                  <p className="text-sm text-gray-400 font-medium">ไม่มีเอกสารแนบ</p>
                )}
              </div>
            </div>

            {rejecting && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">เหตุผลที่ไม่ผ่าน</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="เช่น เอกสารไม่ครบถ้วน"
                />
              </div>
            )}
          </div>
        )}

        <div className="pt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="py-3 px-6 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest"
          >
            ปิด
          </button>

          {applicant?.status === 'REVIEWING' && (
            rejecting ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setRejecting(false); setReason(''); }}
                  className="py-3 px-5 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={!reason.trim() || updateStatus.isPending}
                  onClick={handleConfirmReject}
                  className="py-3 px-5 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-red-500/20 transition-all text-sm uppercase tracking-widest"
                >
                  ยืนยันไม่ผ่าน
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={() => setRejecting(true)}
                  className="py-3 px-5 rounded-2xl border-2 border-red-100 text-red-500 font-black hover:bg-red-50 transition-all text-sm uppercase tracking-widest"
                >
                  ไม่ผ่าน
                </button>
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={handleApprove}
                  className="py-3 px-5 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 disabled:opacity-40 shadow-xl shadow-emerald-500/20 transition-all text-sm uppercase tracking-widest"
                >
                  อนุมัติผ่าน
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Type-check**

Run from `frontend/`: `npx tsc --noEmit`
Expected: no errors in this new file (it's not imported anywhere yet, so this only validates the file itself compiles standalone — full wiring is verified in Task 9).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/modules/applicants/components/ApplicantDetailModal.tsx
git commit -m "feat: add ApplicantDetailModal with document links and approve/reject"
```

---

### Task 9: Frontend — wire the modal into `ApplicantsView`

**Files:**
- Modify: `frontend/src/modules/applicants/views/ApplicantsView.tsx`

**Interfaces:**
- Consumes: `ApplicantTable` (with new `onView` prop, Task 7), `ApplicantDetailModal` (Task 8).

- [ ] **Step 1: Add dialog state and imports**

Replace:

```tsx
import React, { useState } from 'react';
import { Search, Download, Printer } from 'lucide-react';
import { useApplicants, useApplicantMutation } from '../hooks/use-applicants';
import { ApplicantTable } from '../components/ApplicantTable';
import { PremiumButton, PremiumCard } from '../../../components/ui/PremiumBase';
import { PremiumInput, PremiumSelect } from '../../../components/ui/FormControls';

export const ApplicantsView = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    year: new Date().getFullYear() + 543,
  });
```

with:

```tsx
import React, { useState } from 'react';
import { Search, Download, Printer } from 'lucide-react';
import { useApplicants, useApplicantMutation } from '../hooks/use-applicants';
import { ApplicantTable } from '../components/ApplicantTable';
import { ApplicantDetailModal } from '../components/ApplicantDetailModal';
import { PremiumButton, PremiumCard } from '../../../components/ui/PremiumBase';
import { PremiumInput, PremiumSelect } from '../../../components/ui/FormControls';

export const ApplicantsView = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    year: new Date().getFullYear() + 543,
  });
  const [viewingApplicantId, setViewingApplicantId] = useState<string | null>(null);
```

- [ ] **Step 2: Pass `onView` and render the modal**

Replace:

```tsx
      {/* Table Content */}
      <ApplicantTable 
        applicants={applicants}
        pagination={pagination}
        loading={isLoading}
        currentPage={filters.page}
        onPageChange={handlePageChange}
        onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
      />
    </div>
  );
};
```

with:

```tsx
      {/* Table Content */}
      <ApplicantTable 
        applicants={applicants}
        pagination={pagination}
        loading={isLoading}
        currentPage={filters.page}
        onPageChange={handlePageChange}
        onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
        onView={setViewingApplicantId}
      />

      <ApplicantDetailModal
        applicantId={viewingApplicantId}
        onClose={() => setViewingApplicantId(null)}
      />
    </div>
  );
};
```

- [ ] **Step 3: Type-check**

Run from `frontend/`: `npx tsc --noEmit`
Expected: no errors — this resolves the `onView` prop error that Task 7 introduced.

- [ ] **Step 4: Manual verification**

Run from `frontend/`: `npm run dev`, open `/admin/applicants`.

1. A PENDING row shows a "ตรวจสอบ" button. Click it → status badge changes to "กำลังตรวจสอบ" and the detail dialog opens showing the applicant's data.
2. In the dialog, document links open in a new tab.
3. Click "ไม่ผ่าน" → textarea appears, "ยืนยันไม่ผ่าน" is disabled until text is entered → enter text, confirm → dialog closes, row status is "ไม่ผ่าน".
4. Re-open a PENDING applicant, click "ตรวจสอบ", then click "อนุมัติผ่าน" directly → dialog closes, row status is "เบื้องต้นผ่าน".
5. Click "ดูรายละเอียด" on an APPROVED/REJECTED row → dialog opens with only the "ปิด" button, no approve/reject.
6. Bottom-left "ปิด" closes the dialog with no side effects in every case.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/applicants/views/ApplicantsView.tsx
git commit -m "feat: wire ApplicantDetailModal into ApplicantsView"
```

---

## Self-Review Notes

- **Spec coverage:** All 4 design sections (backend status/reason validation, frontend service/hooks, dynamic table action, detail dialog with documents + approve/reject) map to Tasks 1-3, 4-6, 7, 8-9 respectively.
- **Type consistency:** `updateStatus.mutate({ id, status, reason? })` shape (Task 6) matches every call site introduced (Task 7's `onUpdateStatus(app.id, 'REVIEWING')` → `ApplicantsView`'s `(id, status) => updateStatus.mutate({ id, status })`, Task 8's `updateStatus.mutate({ id: applicantId, status: 'REJECTED', reason })`). `ApplicantDocument['type']` (Task 4) matches the keys used in `DOCUMENT_LABELS` (Task 8) and the backend `DocumentType` enum (`backend/prisma/schema.prisma:176-184`).
- **No placeholders:** every step has literal code, exact file paths, and runnable commands.
