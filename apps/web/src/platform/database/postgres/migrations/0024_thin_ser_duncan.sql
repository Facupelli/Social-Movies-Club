ALTER TABLE "ratings" ALTER COLUMN "watched_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "watched_date" DROP NOT NULL;