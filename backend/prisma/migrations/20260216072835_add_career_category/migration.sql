-- AlterTable
ALTER TABLE "Career" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general';

-- CreateIndex
CREATE INDEX "Career_category_idx" ON "Career"("category");
