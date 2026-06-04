-- Add soft-delete flag to laboratories so deleting a lab no longer violates asset foreign keys.
ALTER TABLE "Laboratory"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
