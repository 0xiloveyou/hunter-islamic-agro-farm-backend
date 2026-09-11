-- CreateEnum
CREATE TYPE "applyAsShark" AS ENUM ('FALSE', 'PENDING', 'APPROVED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "applyAsShark" "applyAsShark" NOT NULL DEFAULT 'FALSE';
