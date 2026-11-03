-- AlterTable
ALTER TABLE "ProductVariation" ADD COLUMN "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN "color" TEXT,
ADD COLUMN "images" TEXT NOT NULL DEFAULT '[]';
