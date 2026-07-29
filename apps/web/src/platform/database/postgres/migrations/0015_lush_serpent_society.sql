DELETE FROM "notifications" WHERE "is_deleted" = true;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "notifications" n
    LEFT JOIN "users" u ON u."id" = n."recipient_id"
    WHERE u."id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot migrate notifications: active notifications have recipients that do not exist';
  END IF;
END
$$;--> statement-breakpoint
CREATE FUNCTION pg_temp.notification_metadata_to_jsonb(input_text text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN input_text::jsonb;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('raw', input_text);
END;
$$;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "type_code" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "data" jsonb;--> statement-breakpoint
UPDATE "notifications"
SET
  "type_code" = "type_id",
  "data" = jsonb_build_object(
    'actorUsername', "actor_username",
    'actorImage', "actor_image",
    'actionUrl', "action_url",
    'legacyTitle', "title",
    'legacyMessage', "message",
    'legacyMetadata', pg_temp.notification_metadata_to_jsonb("metadata"),
    'legacyUpdatedAt', to_jsonb("updated_at")
  );--> statement-breakpoint
UPDATE "notifications" n
SET "actor_id" = NULL
WHERE "actor_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "users" u WHERE u."id" = n."actor_id"
  );--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "data" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "data" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_type_id_notification_types_id_fk";--> statement-breakpoint
DROP INDEX "recipient_unread_idx";--> statement-breakpoint
DROP INDEX "recipient_created_at_idx";--> statement-breakpoint
DROP INDEX "type_created_at_idx";--> statement-breakpoint
DROP INDEX "actor_created_at_idx";--> statement-breakpoint
DROP INDEX "notifications_unseen_partial_idx";--> statement-breakpoint
DROP INDEX "notifications_unread_count_idx";--> statement-breakpoint
DROP INDEX "notifications_list_idx";--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_actor_created_idx" ON "notifications" USING btree ("actor_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_type_created_idx" ON "notifications" USING btree ("type_code","created_at");--> statement-breakpoint
CREATE INDEX "notifications_unread_count_idx" ON "notifications" USING btree ("recipient_id","read_at") WHERE read_at IS NULL;--> statement-breakpoint
CREATE INDEX "notifications_list_idx" ON "notifications" USING btree ("recipient_id","created_at","id");--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "type_id";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "message";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "actor_username";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "actor_image";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "action_url";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "updated_at";--> statement-breakpoint
DROP TABLE "notification_types";