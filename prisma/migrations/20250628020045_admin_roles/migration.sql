/*
  Warnings:

  - Added the required column `role` to the `RachaAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RachaAdmin" ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ativo';
