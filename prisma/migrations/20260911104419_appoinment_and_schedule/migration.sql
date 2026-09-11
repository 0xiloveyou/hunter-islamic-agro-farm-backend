-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "purpose" TEXT,
    "notes" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "appointmentUrl" TEXT,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_scheduleId_key"
ON "Appointment"("scheduleId");

-- CreateIndex
CREATE INDEX "Appointment_userId_idx"
ON "Appointment"("userId");

-- CreateIndex
CREATE INDEX "Appointment_status_idx"
ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Schedule_scheduledAt_idx"
ON "Schedule"("scheduledAt");

-- CreateIndex
CREATE INDEX "Schedule_isBooked_idx"
ON "Schedule"("isBooked");

-- AddForeignKey
ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_scheduleId_fkey"
FOREIGN KEY ("scheduleId")
REFERENCES "Schedule"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;