CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_code" text NOT NULL,
	"actor_id" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deduplication_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activities_deduplication_key_unique" UNIQUE("deduplication_key")
);
--> statement-breakpoint
CREATE TABLE "feed_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feed_owner_id" text NOT NULL,
	"activity_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"delivered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"seen_at" timestamp with time zone,
	CONSTRAINT "feed_deliveries_owner_activity_unique" UNIQUE("feed_owner_id","activity_id")
);
--> statement-breakpoint
CREATE TABLE "rating_activities" (
	"activity_id" uuid PRIMARY KEY NOT NULL,
	"rating_id" uuid NOT NULL,
	CONSTRAINT "rating_activities_rating_id_unique" UNIQUE("rating_id")
);
--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
UPDATE "ratings" SET "updated_at" = "created_at";--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_deliveries" ADD CONSTRAINT "feed_deliveries_feed_owner_id_users_id_fk" FOREIGN KEY ("feed_owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_deliveries" ADD CONSTRAINT "feed_deliveries_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_activities" ADD CONSTRAINT "rating_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_activities" ADD CONSTRAINT "rating_activities_rating_id_ratings_id_fk" FOREIGN KEY ("rating_id") REFERENCES "public"."ratings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_occurred_at_idx" ON "activities" USING btree ("occurred_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "feed_deliveries_activity_idx" ON "feed_deliveries" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "feed_deliveries_owner_timeline_idx" ON "feed_deliveries" USING btree ("feed_owner_id","occurred_at" DESC NULLS LAST,"id" DESC NULLS LAST);