/*
  Warnings:

  - You are about to drop the column `expectdedoutput` on the `TestCase` table. All the data in the column will be lost.
  - Added the required column `expectedOutput` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "expectdedoutput",
ADD COLUMN     "expectedOutput" TEXT NOT NULL;
