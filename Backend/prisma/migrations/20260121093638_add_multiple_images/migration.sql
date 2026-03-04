/*
  Warnings:

  - You are about to drop the column `image` on the `Thread` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Thread" DROP COLUMN "image",
ADD COLUMN     "images" TEXT[];
