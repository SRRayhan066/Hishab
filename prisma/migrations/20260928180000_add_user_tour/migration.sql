ALTER TABLE "User" ADD COLUMN "tourCompletedAt" TIMESTAMP(3);

UPDATE "User" SET "tourCompletedAt" = CURRENT_TIMESTAMP;
