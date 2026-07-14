-- AlterTable: public-facing program detail copy (what you study / skills gained / careers)
ALTER TABLE "programs" ADD COLUMN "curriculum" TEXT;
ALTER TABLE "programs" ADD COLUMN "skills" TEXT;
ALTER TABLE "programs" ADD COLUMN "career_paths" TEXT;
