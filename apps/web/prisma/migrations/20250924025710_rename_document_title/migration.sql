-- Rename title column to name
ALTER TABLE "documents" RENAME COLUMN "title" TO "name";

-- Update slideConfig default value
ALTER TABLE "documents" ALTER COLUMN "slideConfig" SET DEFAULT '{"header": "", "footer": ""}';
