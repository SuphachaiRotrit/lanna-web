-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "current_application_year" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
