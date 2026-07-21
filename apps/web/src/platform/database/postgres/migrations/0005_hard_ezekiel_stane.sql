ALTER TABLE "media" DROP CONSTRAINT "media_tmdb_id_unique";--> statement-breakpoint
DROP INDEX "ratings_recent_idx";--> statement-breakpoint
CREATE INDEX "ratings_recent_idx" ON "ratings" USING btree ("user_id","created_at");