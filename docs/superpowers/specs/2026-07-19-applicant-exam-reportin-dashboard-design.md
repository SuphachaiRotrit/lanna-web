# Design: ผลสอบ / อนุมัติรายงานตัว / การ์ดสาขา + Dashboard รายปี / เก็บข้อมูลย้อนหลัง 3 ปี

วันที่: 2026-07-19
สถานะ: อนุมัติแล้ว รอเขียนแผน implementation

## เป้าหมาย

หน้าจัดการใบสมัคร (`/admin/applicants`) และ Dashboard (`/admin/dashboard`) ของระบบรับสมัครนักศึกษา มมร. วิทยาเขตล้านนา ต้องรองรับ workflow เพิ่มเติมหลังขั้นตอนตรวจเอกสารเดิม:

1. บันทึกผลสอบ (สอบผ่าน/ไม่ผ่าน) ของผู้สมัครที่เอกสารผ่านแล้ว (`APPROVED`)
2. อนุมัติ/ปฏิเสธการรายงานตัวของผู้สมัครที่สอบผ่านแล้ว
3. เลือกดูใบสมัครแยกตามสาขาวิชาแบบการ์ด แทนการกรองด้วย dropdown อย่างเดียว
4. Dashboard ดูสถิติย้อนหลังได้ทีละปี พร้อมตัวเลข "รายงานตัวแล้ว"
5. ผู้ดูแลระบบระดับสูงลบข้อมูลผู้สมัครที่เก่ากว่า 3 ปีได้ โดยต้อง export Excel สำรองก่อนลบเสมอ

## สถานะปัจจุบัน (สรุปจากการสำรวจโค้ด)

- `Applicant.status`: `PENDING → REVIEWING → APPROVED/REJECTED/CANCELLED` (`backend/prisma/schema.prisma`)
- ยังไม่มีแนวคิดเรื่องผลสอบหรือการรายงานตัวในระบบเลย
- ตาราง/modal ผู้สมัคร: `frontend/src/modules/applicants/{views,components}` + `frontend/src/modules/applicants/hooks/use-applicants.ts`
- Backend: `backend/src/modules/applicant/{applicant.controller.ts,applicant.service.ts}`, filter ตาม `programId` มีอยู่แล้วใน `QueryApplicantDto`/`findAll()`
- รายชื่อสาขา (program) พร้อมจำนวนผู้สมัครมีอยู่แล้วที่ `GET admin/programs` (`program.service.ts findAll()`) และมี hook `usePrograms()` (`modules/admin-programs/hooks/use-programs.ts`) ใช้ซ้ำได้ทันที
- Dashboard: `backend/src/modules/dashboard/dashboard.service.ts` คำนวณสถิติเฉพาะปีปัจจุบัน (`currentYear`) เท่านั้น, ไม่มี query param ปี
- Export: `backend/src/modules/export/export.service.ts` มี `exportExcel(query, ids?)` รองรับ filter `year` อยู่แล้ว, เรียกผ่าน `ExportController` (`POST admin/export/excel`)
- Role-based guard มีแพทเทิร์นพร้อมใช้: `RolesGuard` + `@Roles('SUPER_ADMIN')` (ใช้ใน `user.controller.ts`)
- ลบไฟล์ใน storage มี `uploadService.deleteFile(key)` อยู่แล้ว
- `AuditLogMiddleware` log ทุก mutating request ใต้ `/api/admin` อัตโนมัติ ไม่ต้องเพิ่มโค้ด logging เอง
- `Document.applicantId` มี `onDelete: Cascade` อยู่แล้ว — ลบ Applicant แล้ว Document row หายตามอัตโนมัติ

---

## ส่วนที่ 2: ผลสอบ + อนุมัติรายงานตัว + การ์ดสาขา

### 2.1 Data model (`backend/prisma/schema.prisma`)

เพิ่ม 2 enum และ 4 field ใน `Applicant` (ไม่แตะ field เดิม):

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

model Applicant {
  // ...
  examResult      ExamResult      @default(NOT_YET) @map("exam_result")
  reportInStatus  ReportInStatus  @default(NOT_YET) @map("report_in_status")
  reportInReason  String?         @db.Text @map("report_in_reason")
  reportInAt      DateTime?       @map("report_in_at")
}
```

กติกาลำดับขั้น (ต้อง `APPROVED` ก่อนปรับผลสอบได้, ต้อง `PASSED` ก่อนอนุมัติรายงานตัวได้) ตรวจใน service layer ไม่ใช้ DB constraint

### 2.2 Backend API (`applicant.controller.ts` / `.service.ts`)

Endpoint ใหม่ 2 ตัว ตามแพทเทิร์นเดิมของ `updateStatus`:

- `PATCH admin/applicants/:id/exam` — body `{ examResult }`
  - 400 ถ้า `applicant.status !== 'APPROVED'`
- `PATCH admin/applicants/:id/report-in` — body `{ reportInStatus, reason? }`
  - `reason` บังคับเมื่อ `reportInStatus === 'REJECTED'` (เหมือน `UpdateStatusDto` เดิม)
  - 400 ถ้า `applicant.examResult !== 'PASSED'`
  - set `reportInAt = new Date()` ทุกครั้งที่เปลี่ยน

Filter ตามสาขา (`programId`) มีอยู่แล้ว ไม่ต้องแก้ backend ส่วนนี้

### 2.3 Frontend types (`frontend/src/types/index.ts`)

เพิ่ม `ExamResult`, `ReportInStatus` type และ field ใน `Applicant` ให้ตรงกับ schema

### 2.4 ตาราง (`ApplicantTable.tsx`)

เพิ่มคอลัมน์ "ผลสอบ" ต่อจาก "สถานะ" — badge ใหม่ (รอสอบ=เทา, ผ่าน=เขียว, ไม่ผ่าน=แดง) แสดงทุกแถวตามค่า `examResult` จริง (ค่า default `NOT_YET` ก่อน `APPROVED` ก็โชว์ตามนั้น ไม่ต้องมี logic ซ่อน)

### 2.5 Modal (`ApplicantDetailModal.tsx`)

เพิ่ม section ใหม่ "ผลสอบ" และ "รายงานตัว" ต่อจาก section สถานะเดิม แสดงแบบ progressive:

- ปุ่มปรับผลสอบ (ผ่าน/ไม่ผ่าน) โชว์เมื่อ `status === 'APPROVED'`
- ปุ่มอนุมัติ/ปฏิเสธรายงานตัว (มีช่องเหตุผลตอนปฏิเสธ เหมือนแพทเทิร์น reject เอกสารเดิม) โชว์เมื่อ `examResult === 'PASSED'`

ใช้ hook `useApplicantMutation` เดิม เพิ่ม mutation `updateExam`, `updateReportIn` ต่อจาก `updateStatus` ที่มีอยู่

### 2.6 การ์ดเลือกสาขา + filter (`ApplicantsView.tsx`)

- ดึงรายการสาขาด้วย `usePrograms()` ที่มีอยู่แล้ว (ไม่สร้าง hook ใหม่)
- state ใหม่ `selectedProgramId: string | null` (`null` = ยังไม่เลือก → โชว์หน้าการ์ด)
- หน้าการ์ด: การ์ด "ทั้งหมด" + การ์ดแต่ละสาขา (ใช้ `PremiumCard` เดิม) กดแล้ว set `selectedProgramId` → ซ่อนการ์ด โชว์ filter bar + ตารางเดิม พร้อม `programId` เป็นส่วนหนึ่งของ `filters` ที่ส่งเข้า `useApplicants`
- ปุ่ม "← กลับไปเลือกสาขา" เหนือตาราง เพื่อกลับไปหน้าการ์ด

---

## ส่วนที่ 3: Dashboard รายปี + การ์ดรายงานตัว + ลบข้อมูลเก่า

พึ่งพา field `reportInStatus` จากส่วนที่ 2 — implement ส่วนที่ 2 ให้เสร็จก่อน

### 3.1 Dashboard แยกตามปี

**Backend** (`dashboard.controller.ts` / `dashboard.service.ts`):
- `GET admin/dashboard?year=2569` — เพิ่ม query param `year` (optional, default = ปีปัจจุบัน) แทนที่ hardcode `currentYear` ทุกจุดใน `getStats()`
- เพิ่ม `reportedInCount` ใน object `overview` — นับ `applicationYear = year AND reportInStatus = 'CONFIRMED'`

**Frontend**:
- `use-dashboard.ts`: `useDashboardStats(year)` รับ year เข้า queryKey และส่งต่อ API
- `DashboardView.tsx`: เพิ่ม dropdown เลือกปีที่ header (แพทเทิร์นเดียวกับ `ApplicantsView`: ปีปัจจุบัน / -1 / -2), state `selectedYear` default = ปีปัจจุบัน
- `StatsOverview.tsx`: เพิ่มการ์ดที่ 5 "รายงานตัวแล้ว" ใช้ `stats.overview.reportedInCount`, ปรับ grid เป็น `xl:grid-cols-5`

### 3.2 ลบข้อมูลเก่า (ใหม่ทั้งหมด)

ขอบเขต: เก็บข้อมูล 3 ปีล่าสุด (ปีปัจจุบัน + 2 ปีย้อนหลัง) ปีที่เก่ากว่านั้น (`applicationYear <= currentYear - 3`) ลบได้ ต้อง export Excel สำรองก่อนลบเสมอ แอดมิน (`SUPER_ADMIN` เท่านั้น) กดเองทีละครั้ง มี confirm ไม่มี cron อัตโนมัติ

**Backend** — เพิ่ม endpoint เดียวใน `ExportController` ที่มีอยู่แล้ว (ไม่ตั้งโมดูลใหม่):

```
POST admin/export/purge   body: { year: number }
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
```

ลำดับการทำงาน (export ก่อนลบเสมอ กันข้อมูลหายก่อนมีไฟล์สำรอง):
1. เรียก `exportService.exportExcel({ year })` เดิม → ได้ Excel buffer
2. เรียก `applicantService.deletePurgeYear(year)` ใหม่:
   - guard `year <= currentYear - 3` (400 ถ้าไม่ผ่าน — กันเผลอลบปีที่ยังไม่ถึงเกณฑ์ แม้ FE จะจำกัดตัวเลือกมาแล้วก็ตาม)
   - โหลด applicant ปีนั้นพร้อม documents, วน `uploadService.deleteFile(doc.storageKey)` ทีละไฟล์ (best-effort, กัน orphan ไฟล์ PII ใน storage)
   - `prisma.applicant.deleteMany({ where: { applicationYear: year } })` (Document cascade ลบอัตโนมัติ)
   - คืนจำนวนที่ลบ
3. ส่ง Excel buffer กลับเป็นไฟล์ดาวน์โหลด (เหมือน export ปกติ) — ถ้า step 2 throw จะไม่ตอบไฟล์ และ transaction ระดับ DB (`deleteMany`) ไม่ได้ลบอะไรเลยถ้า error ก่อนหน้านั้น

`AuditLogMiddleware` ที่มีอยู่แล้ว log การเรียก endpoint นี้อัตโนมัติ (mutating request ใต้ `/api/admin`) ไม่ต้องเพิ่มโค้ด logging เอง

**Frontend** — section ใหม่ใน `SettingsView.tsx`, แสดงเฉพาะ `useAuth().user?.role === 'SUPER_ADMIN'`:
- `PremiumSelect` เลือกปีที่ลบได้ (`currentYear - 3` ลงไป, 5 ตัวเลือกย้อนหลัง)
- ปุ่ม "Export & ลบข้อมูลปีนี้" → `window.confirm()` แจ้งเตือนว่าลบถาวรและย้อนกลับไม่ได้ → เรียก mutation ใหม่ที่ทำ blob-download แพทเทิร์นเดียวกับ `exportData` ใน `use-applicants.ts` เดิม → toast สำเร็จ → invalidate `["applicants"]`, `["admin-dashboard-stats"]`

### 3.3 Filter ปีในตารางใบสมัคร

มีอยู่แล้ว — `ApplicantsView.tsx` มี dropdown ปี + `filters.year` ส่งเข้า `useApplicants` และ backend `QueryApplicantDto.year` รองรับแล้ว ไม่ต้องแก้อะไรเพิ่ม

---

## Scope ที่ตัดออก (YAGNI) — ไม่ทำในรอบนี้

- ไม่มี cron/automated purge — ต้องกดเองเสมอ (ลดความเสี่ยงลบข้อมูลโดยไม่ตั้งใจ)
- ไม่เพิ่ม endpoint แยกสำหรับ "preview จำนวนที่จะลบ" ก่อน purge — ใช้ confirm dialog ทั่วไปพอ
- ไม่แยก field `examNote`/เหตุผลตอนสอบไม่ผ่าน — ใช้ badge สถานะอย่างเดียว (ต่างจาก reportIn ที่ต้องมีเหตุผลตามที่ผู้ใช้ระบุ)
- ไม่เพิ่ม filter ตาม `examResult`/`reportInStatus` ในตารางหลัก (เพิ่มได้ภายหลังถ้าต้องการ)
- การ์ดสาขาที่หน้าจัดการใบสมัคร: ระดับ Program เท่านั้น ไม่มีชั้น Faculty คั่นกลาง

## Testing / verification

- Backend: รัน `prisma migrate dev` แล้วตรวจ endpoint ใหม่ผ่าน manual request (curl/Postman) กับ guard ลำดับขั้น (exam ก่อน approved ต้อง 400, report-in ก่อน passed ต้อง 400, purge ปีใกล้ปัจจุบันต้อง 400)
- Frontend: เปิดหน้า `/admin/applicants` ทดสอบ flow เต็ม (การ์ดสาขา → อนุมัติเอกสาร → ปรับผลสอบ → อนุมัติรายงานตัว), หน้า `/admin/dashboard` สลับปี, หน้า `/admin/settings` ทดสอบ purge ด้วยปีทดสอบที่มีข้อมูลจำลอง
