ALTER TABLE "ratings" ADD COLUMN "watched_date" date DEFAULT CURRENT_DATE NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_score_range_check" CHECK ("ratings"."score" BETWEEN 1 AND 10);--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_watched_date_not_future_check" CHECK ("ratings"."watched_date" <= CURRENT_DATE);