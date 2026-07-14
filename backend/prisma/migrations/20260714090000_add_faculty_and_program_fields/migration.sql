-- CreateEnum
CREATE TYPE "ProgramTrack" AS ENUM ('REGULAR', 'SPECIAL');

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faculties_name_key" ON "faculties"("name");

-- Backfill: one faculty row per distinct existing programs.faculty value
INSERT INTO "faculties" ("id", "name", "created_at", "updated_at")
SELECT gen_random_uuid()::text, f."faculty", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "faculty" FROM "programs") f;

-- AlterTable: add nullable faculty_id, backfill by name, then enforce NOT NULL
ALTER TABLE "programs" ADD COLUMN "faculty_id" TEXT;

UPDATE "programs" p
SET "faculty_id" = f."id"
FROM "faculties" f
WHERE f."name" = p."faculty";

ALTER TABLE "programs" ALTER COLUMN "faculty_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old freeform faculty string column
ALTER TABLE "programs" DROP COLUMN "faculty";

-- AlterTable: duration String? -> Int?, parse leading digits from existing values (e.g. "4 ปี" -> 4)
ALTER TABLE "programs" ADD COLUMN "duration_num" INTEGER;

UPDATE "programs"
SET "duration_num" = NULLIF(regexp_replace("duration", '[^0-9]', '', 'g'), '')::integer
WHERE "duration" IS NOT NULL;

ALTER TABLE "programs" DROP COLUMN "duration";
ALTER TABLE "programs" RENAME COLUMN "duration_num" TO "duration";

-- AlterTable: ภาคปกติ/ภาคพิเศษ
ALTER TABLE "programs" ADD COLUMN "track" "ProgramTrack" NOT NULL DEFAULT 'REGULAR';
