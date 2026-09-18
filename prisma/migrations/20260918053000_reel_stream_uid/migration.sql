-- AlterTable
ALTER TABLE "Reel" ADD COLUMN "streamUid" TEXT;

-- Backfill existing rows (if any) so the unique constraint can be applied
UPDATE "Reel" SET "streamUid" = 'legacy-' || "id" WHERE "streamUid" IS NULL;

-- AlterTable
ALTER TABLE "Reel" ALTER COLUMN "streamUid" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reel_streamUid_key" ON "Reel"("streamUid");
