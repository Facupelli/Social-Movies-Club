ALTER TABLE "ratings" ADD COLUMN "watched_date" date;--> statement-breakpoint
UPDATE "ratings"
SET "watched_date" = ("created_at" AT TIME ZONE 'UTC')::date
WHERE "watched_date" IS NULL;--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "watched_date" SET DEFAULT CURRENT_DATE;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_watched_date_not_null_check" CHECK ("watched_date" IS NOT NULL) NOT VALID;--> statement-breakpoint
ALTER TABLE "ratings" VALIDATE CONSTRAINT "ratings_watched_date_not_null_check";--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "watched_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_watched_date_not_null_check";--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_score_range_check" CHECK ("score" BETWEEN 1 AND 10) NOT VALID;--> statement-breakpoint
ALTER TABLE "ratings" VALIDATE CONSTRAINT "ratings_score_range_check";--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_watched_date_not_future_check" CHECK ("watched_date" <= CURRENT_DATE) NOT VALID;--> statement-breakpoint
ALTER TABLE "ratings" VALIDATE CONSTRAINT "ratings_watched_date_not_future_check";