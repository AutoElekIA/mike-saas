-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "verificationNotes" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT,
ADD COLUMN     "voucherVerified" BOOLEAN NOT NULL DEFAULT false;
