CREATE INDEX "feed_items_user_unseen_idx" ON "feed_items" USING btree ("user_id",seen_at NULLS FIRST,"created_at");--> statement-breakpoint
CREATE INDEX "follows_follower_idx" ON "follows" USING btree ("follower_id","followee_id");--> statement-breakpoint
CREATE INDEX "media_tmdb_idx" ON "media" USING btree ("tmdb_id","type");--> statement-breakpoint
CREATE INDEX "media_type_title_idx" ON "media" USING btree ("type","title");--> statement-breakpoint
CREATE INDEX "notifications_unread_count_idx" ON "notifications" USING btree ("recipient_id","read_at") WHERE is_deleted = false;--> statement-breakpoint
CREATE INDEX "notifications_list_idx" ON "notifications" USING btree ("recipient_id","created_at") WHERE is_deleted = false;--> statement-breakpoint
CREATE INDEX "notifications_unseen_partial_idx" ON "notifications" USING btree ("recipient_id","created_at") WHERE read_at IS NULL AND is_deleted = false;--> statement-breakpoint
CREATE INDEX "ratings_user_media_idx" ON "ratings" USING btree ("user_id","media_id");--> statement-breakpoint
CREATE INDEX "ratings_media_created_idx" ON "ratings" USING btree ("media_id","created_at");--> statement-breakpoint
CREATE INDEX "ratings_feed_idx" ON "ratings" USING btree ("user_id","created_at","media_id");--> statement-breakpoint
CREATE INDEX "ratings_media_user_created_idx" ON "ratings" USING btree ("media_id","user_id","created_at");--> statement-breakpoint
-- Note: Skipping ratings_recent_idx due to NOW() not being immutable for partial indexes
-- Manual creation needed if recent-only filtering is critical
-- CREATE INDEX "ratings_recent_idx" ON "ratings" USING btree ("user_id","created_at") WHERE created_at > NOW() - INTERVAL '1 year';
CREATE INDEX "users_username_idx" ON "users" USING btree ("username") WHERE username IS NOT NULL;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "watchlist_user_idx" ON "watchlist" USING btree ("user_id","created_at");