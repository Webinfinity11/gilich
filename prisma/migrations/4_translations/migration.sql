-- AlterTable
ALTER TABLE "ProductAttribute" ADD COLUMN "valuesKa" TEXT NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "ProductVariation" ADD COLUMN "nameKa" TEXT;
