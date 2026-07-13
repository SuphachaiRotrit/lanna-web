# แผนดีพลอย lanna-web ขึ้น Vercel (front + back) และ Supabase (ฐานข้อมูล)

## สถานะปัจจุบัน

- **Phase 2 (แก้โค้ด backend ให้รันบน Vercel serverless ได้) — เสร็จแล้ว** สร้าง `backend/src/bootstrap.ts`, `backend/api/index.ts` ใหม่ และแก้ `main.ts`, `vercel.json`, `tsconfig.build.json`, `prisma/schema.prisma`, `package.json`, `Dockerfile` — ตรวจสอบแล้วว่า build ผ่าน (`npm run build` สำเร็จ และ `dist/` ไม่มีโฟลเดอร์ `api/` ปนมา)
- **สิ่งผิดปกติที่พบ (ไม่ได้เกิดจากงานนี้):** `.github/workflows/ci.yml` หายไปจาก working tree และ `backend/tsconfig.json` มีการแก้ไขที่ยังไม่ commit (`tsBuildInfoFile`) — ทั้งสองอย่างนี้ไม่ได้เกิดจาก session นี้ คาดว่าน่าจะมีโปรเซสอื่นแก้ไฟล์ในโฟลเดอร์เดียวกันอยู่พร้อมกัน **Phase 5 ด้านล่างต้องใช้ไฟล์ `ci.yml`** (เป็นไฟล์ที่มี job `migrate`) ต้องแก้ไขปัญหานี้ก่อน (รันคำสั่ง `git checkout -- .github/workflows/ci.yml` เพื่อกู้ไฟล์กลับจาก commit ล่าสุด `eb457c0`)
- **Phase 1, 3, 4, 5, 6 — ยังไม่เริ่ม** เป็นงานที่ต้องทำผ่าน dashboard/บัญชีของคุณเอง (Supabase, Vercel 2 โปรเจกต์, GitHub secrets) ไม่สามารถทำแทนได้จาก session นี้ — แต่ช่วย generate ค่า secret แบบสุ่มให้ได้ (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`) ถ้าต้องการ
- **ที่เก็บไฟล์ผู้สมัคร (สรุปไว้เผื่ออ้างอิง):** ไฟล์เอกสาร/รูปที่ผู้สมัครอัปโหลด (`backend/src/modules/upload/upload.service.ts` เมธอด `uploadFile`/`getSignedUrl`/`deleteFile`) เก็บบน **Supabase Storage** (private bucket + signed URL) ต้องสร้าง bucket ชื่อ `documents` (หรือชื่อที่ตรงกับ `SUPABASE_STORAGE_BUCKET`) แบบ private ใน Supabase project เดียวกับที่ใช้ทำฐานข้อมูล (Phase 1) แล้วตั้งค่า `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_STORAGE_BUCKET`
- **ฟีเจอร์ backup ถูกลบออกทั้งหมดแล้ว** (backend module, frontend หน้า/เมนู, Cloudflare R2, Google Drive export, cron job, ตาราง `backup_logs`) — ไม่มี R2/Google Drive/CRON_SECRET ให้ตั้งค่าอีกต่อไป

## บริบท (ทำไมต้องทำแบบนี้)

โปรเจกต์นี้เป็น monorepo: `backend/` (NestJS 11, Express platform, Prisma/Postgres) และ `frontend/` (Next.js 16) ปัจจุบันรันผ่าน `docker-compose` กับ Postgres ที่รันในเครื่อง เป้าหมายคือ deploy ขึ้นจริง: ทั้งสองแอปขึ้น Vercel (แยกเป็น 2 โปรเจกต์ Vercel) และฐานข้อมูล Postgres ใช้ Supabase

โค้ดในโปรเจกต์นี้ถูกเตรียมไว้ **บางส่วน** สำหรับ Vercel+Supabase อยู่แล้วจากงานก่อนหน้า — `.env.example`, `prisma.config.ts`, ระบบ rewrite proxy ใน `next.config.ts`, การเก็บไฟล์ผ่าน R2 ใน `upload.service.ts`, และ job `migrate` ใน `.github/workflows/ci.yml` ล้วนเตรียมไว้รองรับ Vercel+Supabase อยู่แล้ว แต่มีจุดที่ยังไม่เสร็จอยู่จุดหนึ่ง: **backend ยังไม่มี entrypoint สำหรับ serverless** เดิม `backend/vercel.json` มีแค่ cron ประกาศไว้ ไม่มี handler ใน `api/` ให้ Vercel รันจริง ทำให้ backend deploy ขึ้น Vercel ไม่ได้เลยถ้าไม่แก้ตรงนี้ก่อน — นี่คือจุดเดียวที่เป็นการแก้โค้ดจริงในแผนนี้ ส่วนที่เหลือเป็นการตั้งค่า environment/โปรเจกต์ล้วนๆ

ข้อเท็จจริงด้านสถาปัตยกรรมที่สำคัญที่เจอตอนอ่านโค้ด: ฝั่ง frontend เรียก API ด้วย axios พร้อมส่ง cookie (`withCredentials: true`, ดูที่ `frontend/src/lib/call-api.ts`) และฝั่ง backend ตั้งค่า cookie login ด้วย `sameSite: 'lax'` (`auth.controller.ts`) — cookie แบบ Lax **จะไม่ถูกส่งไปกับ cross-site XHR** ดังนั้นถ้าให้ browser เรียก domain ของ backend บน Vercel ตรงๆ ระบบ login จะพังแบบเงียบๆ (เข้าไม่ได้แต่ไม่ error ชัดเจน) นี่คือเหตุผลที่ `next.config.ts` มี rewrite proxy อยู่แล้ว (`/api/:path*` → `BACKEND_INTERNAL_URL`) — ตอน production browser ต้องคุยกับ domain ของ frontend เท่านั้น แล้วให้ server ฝั่ง frontend proxy ต่อไปยัง backend เอง เพราะฉะนั้น `NEXT_PUBLIC_API_URL` ต้องตั้งเป็น path แบบ relative (`/api`) ใน Vercel frontend project ห้ามใส่เป็น URL เต็มของ backend

## Phase 1 — สร้างโปรเจกต์ Supabase

1. สร้างโปรเจกต์ Supabase (เลือก region ใกล้ผู้ใช้งาน เช่น Singapore ถ้าผู้ใช้อยู่ไทย)
2. ไปที่ Settings → Database → Connection string แล้วคัดลอกมา 2 แบบ:
   - **Pooled** (port 6543, transaction mode) → ใช้เป็น `DATABASE_URL` — ให้เติม `&connection_limit=1` ต่อท้าย `?pgbouncer=true` เดิมด้วย เพราะแต่ละครั้งที่ serverless function ทำงาน จะเปิด connection ใหม่ ถ้าไม่จำกัดจะทำให้ connection pool ของ Supabase เต็มเร็วเวลามีคนใช้พร้อมกันเยอะๆ
   - **Direct** (port 5432) → ใช้เป็น `DIRECT_URL` — ใช้แค่ตอนรัน `prisma migrate deploy`/CLI เท่านั้น (ดู `prisma.config.ts`) ไม่ได้ใช้ตอน runtime จริง
3. เก็บ connection string ทั้งสองไว้ใช้ใน Phase 3 และ Phase 5

## Phase 2 — Backend: เพิ่ม entrypoint สำหรับ Vercel serverless (เสร็จแล้ว)

ออกแบบโดยอิงจาก bootstrap เดิมใน `backend/src/main.ts` และการตั้งค่า DI ใน `backend/src/app.module.ts`:

- **ไฟล์ใหม่ `backend/src/bootstrap.ts`** — ดึงทุกอย่างจาก `main.ts` ยกเว้น `listen()` มาไว้ในฟังก์ชัน `createApp()` (การ serve ไฟล์ local แบบเดิมถูกลบออกแล้ว เพราะ upload ทั้งหมดย้ายไป Supabase Storage แล้ว ไม่มีการเขียนไฟล์ลงดิสก์อีกต่อไป)
- **แก้ `backend/src/main.ts`** — เปลี่ยนให้เรียกใช้ `createApp()` แล้วค่อย `app.listen(port)` เหมือนเดิม พฤติกรรมตอนรัน local หรือผ่าน Docker ไม่เปลี่ยน
- **ไฟล์ใหม่ `backend/api/index.ts`** — handler สำหรับ serverless:
  ```ts
  import type { IncomingMessage, ServerResponse } from 'http';
  import { createApp } from '../src/bootstrap';

  let server: (req: IncomingMessage, res: ServerResponse) => void;

  async function getServer() {
    if (!server) {
      const app = await createApp();
      await app.init();
      server = app.getHttpAdapter().getInstance();
    }
    return server;
  }

  export default async function handler(req: IncomingMessage, res: ServerResponse) {
    const expressApp = await getServer();
    expressApp(req, res);
  }
  ```
  ตัวแปร `server` ที่เก็บไว้ระดับ module จะแคช Nest app ไว้ใช้ซ้ำตอน warm invocation (เรียกซ้ำโดยที่ instance ยังไม่ถูกปิด) ไม่ต้องใช้ package `@vercel/node` เพิ่ม เพราะ Express (ที่อยู่ข้างใน Nest) จัดการ req/response เองอยู่แล้ว — `getHttpAdapter().getInstance()` จะคืนค่า Express instance ตัวเดิมที่ Nest ใช้อยู่ เพราะ `@nestjs/platform-express` เป็น platform package ตัวเดียวที่ติดตั้งไว้ (ไม่ต้องสร้าง `ExpressAdapter` เองแยกต่างหาก)
- **แก้ `backend/vercel.json`** — เพิ่ม rewrite ให้ทุก path ที่ขึ้นต้นด้วย `/api/*` วิ่งเข้า function เดียวกันหมด (แค่มีโฟลเดอร์ `api/` อย่างเดียวตาม convention ของ Vercel จะ map แค่ `api/index.ts` → `/api` เท่านั้น ไม่ได้ครอบคลุมถึง `/api/*` โดยอัตโนมัติ):
  ```json
  {
    "rewrites": [
      { "source": "/api/(.*)", "destination": "/api/index.ts" }
    ],
    "functions": {
      "api/index.ts": { "maxDuration": 10 }
    }
  }
  ```
  `10` วินาที คือค่าสูงสุดของแผน Hobby (ยืนยันแล้วว่าจะ deploy บนแผน Hobby) — ตอนนี้ไม่มี route ไหนที่เสี่ยงเกิน 10 วินาทีแล้ว (เดิมมีแค่ endpoint backup ที่เสี่ยง แต่ฟีเจอร์นั้นถูกลบออกไปทั้งหมด)
- **แก้ `backend/tsconfig.build.json`** — เพิ่ม `"api"` เข้าไปใน `exclude` เพื่อไม่ให้ `nest build` (ที่ Docker ใช้) พังเพราะ error เรื่อง `rootDir` จากโฟลเดอร์ `api/` ใหม่ ฝั่ง Vercel จะ build `api/index.ts` แยกต่างหากด้วยตัวเอง (ใช้ esbuild bundle ทีละ function) ไม่ได้เรียก `nest build` เลย เพราะฉะนั้นการ exclude นี้ไม่กระทบ build ฝั่ง Vercel
- **แก้ `backend/prisma/schema.prisma`** — เพิ่ม binary target สำหรับ runtime แบบ Lambda ของ Vercel ไม่งั้น engine binary ของ Prisma ที่ build มาจะใช้กับ OS ไม่ตรงกัน:
  ```prisma
  generator client {
    provider      = "prisma-client-js"
    binaryTargets = ["native", "rhel-openssl-3.0.x"]
  }
  ```
- **แก้ `backend/package.json`** — เพิ่ม `"postinstall": "prisma generate"` เพราะ Vercel จะรัน `npm install` ก่อน build เสมอ ถ้าไม่มีบรรทัดนี้ Prisma client จะไม่ถูก generate และทุก query DB จะ error ตอน runtime (ฝั่ง Docker มีขั้นตอน `RUN npx prisma generate` อยู่แล้วชัดเจน การเพิ่ม postinstall ไม่ชนกัน แค่รัน generate ซ้ำอีกรอบเฉยๆ)

## Phase 3 — Deploy backend ขึ้น Vercel

1. สร้าง Vercel project ใหม่ ตั้ง **Root Directory เป็น `backend`** framework preset เลือก "Other" (Vercel จะ auto-detect function ใน `api/` เอง)
2. ตั้งค่า Environment Variables (ทั้ง Production และ Preview ถ้าต้องการ): `DATABASE_URL`, `DIRECT_URL` (จาก Phase 1), `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRATION`, `JWT_REFRESH_EXPIRATION`, `ENCRYPTION_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` (ที่เก็บไฟล์ผู้สมัคร), `TURNSTILE_SECRET_KEY`, `FRONTEND_URL` (ตั้งได้หลังจากรู้ URL ของ frontend ใน Phase 4 แล้ว — ใช้กับ CORS และ CSP `connectSrc`), `NODE_ENV=production`
3. กด deploy แล้วจด domain ของ backend ที่ได้ (เช่น `lanna-backend.vercel.app`) ไว้ใช้ตั้งค่า `BACKEND_INTERNAL_URL` ใน Phase 4

## Phase 4 — Deploy frontend ขึ้น Vercel

1. สร้าง Vercel project ใหม่ ตั้ง **Root Directory เป็น `frontend`** framework preset จะ auto-detect เป็น Next.js
2. ตั้งค่า Environment Variables:
   - `NEXT_PUBLIC_API_URL=/api` — ต้องเป็น path **แบบ relative** เท่านั้น ห้ามใส่ URL ของ backend ตรงๆ (ดูเหตุผลในหัวข้อบริบทด้านบน — จำเป็นเพื่อให้ cookie login ทำงานผ่าน proxy แบบ same-origin)
   - `BACKEND_INTERNAL_URL=https://<backend-vercel-domain>` (ห้ามมี `/` ปิดท้าย และห้ามใส่ `/api` ต่อท้าย เพราะ rewrite ใน `next.config.ts` จะเติม `/api/:path*` ให้เองอยู่แล้ว) ตัวแปรนี้ใช้แค่ฝั่ง server เท่านั้น ไม่ถูกส่งไปที่ browser
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (ต้องคู่กับ `TURNSTILE_SECRET_KEY` ฝั่ง backend)
3. กด deploy แล้วจด domain ของ frontend ที่ได้ จากนั้นย้อนกลับไปที่ backend project (Phase 3) ตั้งค่า `FRONTEND_URL` ให้ชี้มาที่ domain นี้ แล้ว redeploy backend ใหม่อีกครั้งเพื่อให้ CORS/CSP อัปเดตตาม

## Phase 5 — รัน migration ผ่าน CI เดิม ไม่ต้องรันมือ

`.github/workflows/ci.yml` มี job `migrate` อยู่แล้วที่รัน `prisma migrate deploy` โดยใช้ `secrets.DIRECT_URL` ทุกครั้งที่ push เข้า branch `main` — ตั้งใจให้แยกจากการรันตอน serverless boot เพราะ serverless ไม่มี "boot hook" ที่ปลอดภัยสำหรับรัน migration ไม่ต้องเขียนอะไรเพิ่ม แค่:

1. ไปที่ GitHub repo → Settings → Secrets and variables → Actions แล้วเพิ่ม secret ชื่อ `DIRECT_URL` = connection string แบบ direct ของ Supabase จาก Phase 1
2. Push โค้ดของ Phase 2 เข้า `main` (หรือรัน workflow ซ้ำ) — ระบบจะรัน migration ที่มีอยู่แล้ว (`20260708092946_init`, `20260713082800_remove_backup_log`) ไปสร้างตารางบน Supabase
3. Seed แอดมินคนแรก: `backend/prisma/seed.ts` จะสร้างบัญชี `admin@mbu-lanna.ac.th` พร้อมรหัสผ่านที่ฝังไว้ในโค้ด (`Admin@2024!`) ให้รันครั้งเดียวกับฐานข้อมูลใหม่ (รัน `npx prisma db seed` ในเครื่อง โดยตั้ง `DIRECT_URL`/`DATABASE_URL` ชี้ไปที่ Supabase ชั่วคราว) แล้ว **รีบ login แล้วเปลี่ยนรหัสผ่านทันที** เพราะรหัสนี้อยู่ใน source code ให้ใครเห็นก็ได้

## Phase 6 — ตรวจสอบให้แน่ใจว่าใช้งานได้จริง (end-to-end)

1. ลองยิง request ไปที่ backend domain ตรงๆ ครั้งนึง เช่น `https://<backend-domain>/api/...` (หรือแค่เช็คว่า `/` ขึ้น 404 ปกติ แต่ route จริงตอบกลับมาถูกต้อง) เพื่อยืนยันว่า function deploy สำเร็จ และ Prisma เชื่อมต่อ Supabase ได้
2. เปิดหน้าเว็บ frontend แล้วลอง login ด้วยแอดมินที่ seed ไว้ — ขั้นตอนนี้จะทดสอบทั้งเส้นทาง: browser → frontend rewrite → backend → Supabase และยืนยันว่า cookie แบบ `sameSite: lax` ถูกตั้งค่าจริง (เช็คใน DevTools → Application → Cookies ที่ domain ของ **frontend** เท่านั้น ไม่ใช่ของ backend)
3. ลองส่งใบสมัคร/อัปโหลดเอกสารจริง 1 รอบแบบ end-to-end เพื่อยืนยันว่าอัปโหลดขึ้น Supabase Storage ได้จริงจาก backend ที่ deploy แล้ว (ไม่ใช่แค่ทดสอบใน localhost ที่อาจซ่อนปัญหาการตั้งค่า Supabase ไว้)

## ไฟล์ที่แก้ไข/สร้างใหม่ (Phase 2)

- สร้างใหม่: `backend/src/bootstrap.ts`, `backend/api/index.ts`
- แก้ไข: `backend/src/main.ts`, `backend/vercel.json`, `backend/tsconfig.build.json`, `backend/prisma/schema.prisma`, `backend/package.json`, `backend/Dockerfile`
- ฝั่ง frontend ไม่ต้องแก้โค้ดเลย — rewrite ใน `next.config.ts` รองรับอยู่แล้ว เหลือแค่ตั้งค่า Environment Variables บน Vercel เท่านั้น
