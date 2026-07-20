-- AlterTable
ALTER TABLE "applicants" ADD COLUMN     "national_id_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "applicants_national_id_hash_key" ON "applicants"("national_id_hash");
