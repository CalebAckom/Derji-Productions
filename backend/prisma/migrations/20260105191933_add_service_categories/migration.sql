/*
  Warnings:

  - You are about to drop the column `category` on the `services` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `services` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");

-- Insert default categories
INSERT INTO "service_categories" ("id", "name", "slug", "description", "sort_order", "updated_at") VALUES
('cat_photography', 'Photography', 'photography', 'Professional photography services including weddings, corporate events, portraits, and more', 1, CURRENT_TIMESTAMP),
('cat_videography', 'Videography', 'videography', 'Video production services including live streaming, post-production, and event coverage', 2, CURRENT_TIMESTAMP),
('cat_sound', 'Sound', 'sound', 'Audio production services including live sound, post-production, and podcast creation', 3, CURRENT_TIMESTAMP);

-- Add the category_id column with a temporary default
ALTER TABLE "services" ADD COLUMN "category_id" TEXT;

-- Update existing services to use the new category IDs
UPDATE "services" SET "category_id" = 'cat_photography' WHERE "category" = 'photography';
UPDATE "services" SET "category_id" = 'cat_videography' WHERE "category" = 'videography';
UPDATE "services" SET "category_id" = 'cat_sound' WHERE "category" = 'sound';

-- Make category_id NOT NULL after data migration
ALTER TABLE "services" ALTER COLUMN "category_id" SET NOT NULL;

-- Drop the old category column
ALTER TABLE "services" DROP COLUMN "category";

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
