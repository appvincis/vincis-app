/*
  Warnings:

  - You are about to drop the column `studyPlanId` on the `Edital` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Edital` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Edital" DROP CONSTRAINT "Edital_studyPlanId_fkey";

-- AlterTable
ALTER TABLE "Edital" DROP COLUMN "studyPlanId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Edital" ADD CONSTRAINT "Edital_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
