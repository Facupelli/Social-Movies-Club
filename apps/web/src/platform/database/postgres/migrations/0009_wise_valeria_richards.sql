DROP INDEX "notifications_list_idx";--> statement-breakpoint
CREATE INDEX "notifications_list_idx" ON "notifications" USING btree ("recipient_id","created_at","id") WHERE is_deleted = false;