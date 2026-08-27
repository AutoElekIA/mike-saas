/*
  Warnings:

  - The values [HOUSE] on the enum `UnitType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `unitOwnerId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `towerId` on the `units` table. All the data in the column will be lost.
  - You are about to drop the `towers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `unit_owners` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `propertyOwnerId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buildingId` to the `units` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CondominiumType" AS ENUM ('VERTICAL', 'HORIZONTAL', 'MIXED', 'FUTURE');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('UNIT', 'LOT');

-- AlterEnum
BEGIN;
CREATE TYPE "UnitType_new" AS ENUM ('APARTMENT', 'PENTHOUSE', 'COMMERCIAL', 'PARKING', 'STORAGE');
ALTER TABLE "public"."units" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "units" ALTER COLUMN "type" TYPE "UnitType_new" USING ("type"::text::"UnitType_new");
ALTER TYPE "UnitType" RENAME TO "UnitType_old";
ALTER TYPE "UnitType_new" RENAME TO "UnitType";
DROP TYPE "public"."UnitType_old";
ALTER TABLE "units" ALTER COLUMN "type" SET DEFAULT 'APARTMENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_unitOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "towers" DROP CONSTRAINT "towers_condominiumId_fkey";

-- DropForeignKey
ALTER TABLE "unit_owners" DROP CONSTRAINT "unit_owners_personId_fkey";

-- DropForeignKey
ALTER TABLE "unit_owners" DROP CONSTRAINT "unit_owners_unitId_fkey";

-- DropForeignKey
ALTER TABLE "unit_owners" DROP CONSTRAINT "unit_owners_userId_fkey";

-- DropForeignKey
ALTER TABLE "units" DROP CONSTRAINT "units_towerId_fkey";

-- AlterTable
ALTER TABLE "condominiums" ADD COLUMN     "type" "CondominiumType" NOT NULL DEFAULT 'VERTICAL';

-- AlterTable
ALTER TABLE "incidents" ADD COLUMN     "propertyId" TEXT;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "unitOwnerId",
ADD COLUMN     "propertyId" TEXT,
ADD COLUMN     "propertyOwnerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "units" DROP COLUMN "towerId",
ADD COLUMN     "buildingId" TEXT NOT NULL,
ADD COLUMN     "floor" INTEGER;

-- DropTable
DROP TABLE "towers";

-- DropTable
DROP TABLE "unit_owners";

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "floors" INTEGER,
    "condominiumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "condominiumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "areaM2" DOUBLE PRECISION,
    "address" TEXT,
    "maintenanceFee" DOUBLE PRECISION,
    "zoneId" TEXT,
    "buildingId" TEXT,
    "condominiumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "areaM2" DOUBLE PRECISION,
    "maintenanceFee" DOUBLE PRECISION,
    "type" "PropertyType" NOT NULL DEFAULT 'UNIT',
    "unitId" TEXT,
    "lotId" TEXT,
    "condominiumId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_owners" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "OwnerStatus" NOT NULL DEFAULT 'OWNER',
    "ownershipSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "percentage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_owners_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_owners" ADD CONSTRAINT "property_owners_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_owners" ADD CONSTRAINT "property_owners_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_owners" ADD CONSTRAINT "property_owners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_propertyOwnerId_fkey" FOREIGN KEY ("propertyOwnerId") REFERENCES "property_owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
