/*
  Warnings:

  - You are about to drop the column `errorDate` on the `ErrorLog` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `ErrorLog` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `ErrorLog` table. All the data in the column will be lost.
  - You are about to drop the column `durationMin` on the `StudyLog` table. All the data in the column will be lost.
  - You are about to drop the column `performance` on the `StudyLog` table. All the data in the column will be lost.
  - You are about to drop the column `studyDate` on the `StudyLog` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `StudyLog` table. All the data in the column will be lost.
  - Added the required column `correction` to the `ErrorLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disciplineId` to the `ErrorLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `ErrorLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicName` to the `ErrorLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `ErrorLog` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `date` to the `StudyLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disciplineId` to the `StudyLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationMinutes` to the `StudyLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicName` to the `StudyLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Discipline" ALTER COLUMN "priority" DROP NOT NULL,
ALTER COLUMN "priority" SET DEFAULT 'MEDIUM',
ALTER COLUMN "priority" SET DATA TYPE TEXT,
ALTER COLUMN "proficiency" DROP NOT NULL,
ALTER COLUMN "proficiency" SET DEFAULT 'BEGINNER',
ALTER COLUMN "proficiency" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ErrorLog" DROP COLUMN "errorDate",
DROP COLUMN "severity",
DROP COLUMN "topicId",
ADD COLUMN     "correction" TEXT NOT NULL,
ADD COLUMN     "disciplineId" INTEGER NOT NULL,
ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "topicName" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudyLog" DROP COLUMN "durationMin",
DROP COLUMN "performance",
DROP COLUMN "studyDate",
DROP COLUMN "topicId",
ADD COLUMN     "correctCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "disciplineId" INTEGER NOT NULL,
ADD COLUMN     "durationMinutes" INTEGER NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "questionsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "topicName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "StudyLog" ADD CONSTRAINT "StudyLog_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
