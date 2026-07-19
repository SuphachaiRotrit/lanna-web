-- CreateEnum
CREATE TYPE "ExamResult" AS ENUM ('NOT_YET', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReportInStatus" AS ENUM ('NOT_YET', 'CONFIRMED', 'REJECTED');

-- AlterTable
ALTER TABLE "applicants" ADD COLUMN     "exam_result" "ExamResult" NOT NULL DEFAULT 'NOT_YET',
ADD COLUMN     "report_in_at" TIMESTAMP(3),
ADD COLUMN     "report_in_reason" TEXT,
ADD COLUMN     "report_in_status" "ReportInStatus" NOT NULL DEFAULT 'NOT_YET';
