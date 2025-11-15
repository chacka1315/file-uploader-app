/*
  Warnings:

  - Added the required column `cloudinaryPublicId` to the `File` table without a default value. This is not possible if the table is not empty.
  - Made the column `downloadName` on table `File` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "cloudinaryPublicId" TEXT NOT NULL,
ALTER COLUMN "downloadName" SET NOT NULL;
