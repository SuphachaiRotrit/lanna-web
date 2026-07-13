# Applicant review flow — design

## Problem

Admin's applicant list (`/admin/applicants`) has a broken "view" (Eye) button —
it has no `onClick`, no frontend API call, and no detail dialog exists at all.
Admin cannot view submitted data, attached documents, or print them. Approve/Reject
are separate always-visible row buttons with no review step in between.

## Goal

Replace the 3 fixed row buttons (Approve/Reject/Eye) with one status-driven
action button per row, backed by a real detail dialog that shows the
applicant's submitted data, links to attached documents, and drives the
approve/reject decision.

## Status flow

```
PENDING (รอตรวจ)
   → click "ตรวจสอบ" → PATCH status=REVIEWING, open detail dialog
REVIEWING (กำลังตรวจสอบ)
   → click "ดูรายละเอียด" → open detail dialog (no status change)
   → in dialog: "อนุมัติผ่าน" → PATCH status=APPROVED, close dialog
   → in dialog: "ไม่ผ่าน" → reason textarea (required) → PATCH status=REJECTED+reason, close dialog
APPROVED / REJECTED / CANCELLED
   → click "ดูรายละเอียด" → open dialog, read-only (Close button only)
```

## Backend changes

- `schema.prisma`: add `rejectionReason String? @map("rejection_reason")` to
  `Applicant` → new migration.
- `PATCH /admin/applicants/:id/status`: replace the raw
  `@Body('status') status: string` with an `UpdateStatusDto`
  (`status: @IsEnum(ApplicationStatus)`, `reason?: @IsString @IsOptional`),
  matching the existing `QueryApplicantDto` pattern
  (`backend/src/modules/applicant/dto/query-applicant.dto.ts`).
  Service (`applicant.service.ts#updateStatus`) throws 400 if
  `status === 'REJECTED'` and `reason` is missing/empty; stores `reason` into
  `rejectionReason` on that branch only.
- `GET /admin/applicants/:id` (`findOne`) already returns full applicant +
  signed document URLs — no change needed.

## Frontend changes

**`frontend/src/services/applicant.service.ts`**
- Add `getApplicantApi(id)` → `GET /admin/applicants/:id`.
- `updateApplicantStatusApi(id, status, reason?)` — pass `reason` through.
- Fix the `Applicant` interface: status union is currently
  `'PENDING' | 'APPROVED' | 'REJECTED' | 'DOCUMENT_REJECTED'` (the last value
  doesn't exist in the Prisma enum, and `REVIEWING`/`CANCELLED` are missing).
  Correct to match `ApplicationStatus` exactly:
  `'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'`.

**`frontend/src/modules/applicants/hooks/use-applicants.ts`**
- Add `useApplicant(id)` query hook, `enabled: !!id` (only fetches while the
  dialog is open).
- `updateStatus` mutation gains optional `reason` param, passed through.

**`frontend/src/modules/applicants/components/ApplicantTable.tsx`**
- Replace the 3 fixed action buttons with one dynamic button per status (see
  Status flow above): label + icon + click handler chosen by `app.status`.
- `onUpdateStatus` stays for the PENDING→REVIEWING transition; add
  `onView(id: string)` prop, called for the REVIEWING/APPROVED/REJECTED/
  CANCELLED cases (dialog-only, no status change).
- Status badge column: currently has no color/icon/label for `REVIEWING` or
  `CANCELLED` (falls through to raw enum string) — add them alongside the
  existing PENDING/APPROVED/REJECTED styling while this file is already being
  touched.

**`frontend/src/modules/applicants/components/ApplicantDetailModal.tsx`** (new)
- Follows the existing plain-div dialog pattern from
  `frontend/src/modules/admin-programs/components/ProgramModal.tsx` (fixed
  overlay + backdrop-blur, `isOpen` prop, early-return `null` when closed) —
  no dialog library in this codebase, stay consistent.
- Props: `applicantId: string | null`, `onClose: () => void`.
- Data via `useApplicant(applicantId)`.
- Body sections: personal info, contact, address, education, parent/guardian
  info, program applied, PDPA consent.
- Documents section: one link per `documents[]` entry, `type` label +
  `fileName`, `href={doc.url}` `target="_blank"` — browser handles
  preview/print natively for the opened tab. No embedded viewer, no custom
  print button.
- Footer, bottom-left: "ปิด" (always present, closes dialog without side
  effects).
- Footer, bottom-right — only rendered when `applicant.status === 'REVIEWING'`:
  - "อนุมัติผ่าน" (green) → `updateStatus.mutate({id, status: 'APPROVED'})` →
    close dialog on success.
  - "ไม่ผ่าน" (red) → reveals an inline required textarea in the dialog;
    button stays disabled until non-empty; confirming calls
    `updateStatus.mutate({id, status: 'REJECTED', reason})` → close dialog on
    success.
- For PENDING/APPROVED/REJECTED/CANCELLED, footer shows only "ปิด"
  (read-only view — PENDING never reaches the dialog without first flipping to
  REVIEWING via the table button, so this branch is effectively for
  APPROVED/REJECTED/CANCELLED).

**`frontend/src/modules/applicants/views/ApplicantsView.tsx`**
- Own `viewingApplicantId: string | null` state.
- Pass `onView={setViewingApplicantId}` to `ApplicantTable`.
- Render `<ApplicantDetailModal applicantId={viewingApplicantId} onClose={() => setViewingApplicantId(null)} />`.
- The PENDING→REVIEWING table button both mutates status and opens the dialog
  (`setViewingApplicantId(id)` fired alongside `updateStatus.mutate(...)` —
  dialog opens immediately, doesn't block on the mutation resolving; the
  dialog's own `useApplicant` fetch shows current data once loaded).

## Out of scope

- No reviewer/audit history (who reviewed, prior status transitions) — not
  requested.
- No confirmation step for "อนุมัติผ่าน" — approve is a single click, only
  reject requires a reason.
- No change to the Excel/PDF bulk export (unaffected).
