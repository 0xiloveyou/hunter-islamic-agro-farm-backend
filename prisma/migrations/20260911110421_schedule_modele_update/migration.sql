/*
  Warnings:

  - A unique constraint covering the columns `[scheduledAt]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Schedule_scheduledAt_key" ON "Schedule"("scheduledAt");
