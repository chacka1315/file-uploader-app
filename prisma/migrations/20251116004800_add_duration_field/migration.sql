/*
  Warnings:

  - Added the required column `duration` to the `Share` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Share" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
