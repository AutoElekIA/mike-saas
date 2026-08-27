/*
  Warnings:

  - You are about to drop the column `type` on the `condominiums` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AdministrationRoleType" AS ENUM ('TREASURER', 'MAINTENANCE', 'SECRETARY', 'PRESIDENT');

-- AlterTable
ALTER TABLE "condominiums" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "voucherUrl" TEXT;

-- CreateTable
CREATE TABLE "administration_periods" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administration_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administration_roles" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleType" "AdministrationRoleType" NOT NULL DEFAULT 'TREASURER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administration_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_configs" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL DEFAULT 2000,
    "earlyPaymentAmount" DOUBLE PRECISION NOT NULL DEFAULT 2000,
    "latePaymentAmount" DOUBLE PRECISION NOT NULL DEFAULT 2200,
    "dueDayOfMonth" INTEGER NOT NULL DEFAULT 10,
    "earlyPaymentDays" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "minutes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "minutes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_configs_condominiumId_key" ON "payment_configs"("condominiumId");

-- AddForeignKey
ALTER TABLE "administration_periods" ADD CONSTRAINT "administration_periods_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administration_roles" ADD CONSTRAINT "administration_roles_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "administration_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administration_roles" ADD CONSTRAINT "administration_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_configs" ADD CONSTRAINT "payment_configs_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "minutes" ADD CONSTRAINT "minutes_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "minutes" ADD CONSTRAINT "minutes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
