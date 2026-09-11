/*
  Warnings:

  - The `applyAsShark` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ApplyAsSharkStatus" AS ENUM ('FALSE', 'PENDING', 'APPROVED');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "applyAsShark",
ADD COLUMN     "applyAsShark" "ApplyAsSharkStatus" NOT NULL DEFAULT 'FALSE';

-- DropEnum
DROP TYPE "applyAsShark";
