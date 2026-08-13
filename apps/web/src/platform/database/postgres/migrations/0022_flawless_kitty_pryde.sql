CREATE TABLE "media_availability_offers" (
	"media_id" uuid NOT NULL,
	"country_code" text NOT NULL,
	"provider_id" uuid NOT NULL,
	"monetization_type" text NOT NULL,
	CONSTRAINT "media_availability_offers_unique" UNIQUE("media_id","country_code","provider_id","monetization_type"),
	CONSTRAINT "media_availability_offers_country_code_check" CHECK ("media_availability_offers"."country_code" ~ '^[A-Z]{2}$')
);
--> statement-breakpoint
CREATE TABLE "media_availability_sync" (
	"media_id" uuid PRIMARY KEY NOT NULL,
	"fetched_at" timestamp with time zone,
	"refresh_lease_until" timestamp with time zone,
	"refresh_not_before" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "streaming_provider_catalog_sync" (
	"country_code" text NOT NULL,
	"kind" "media_kind" NOT NULL,
	"fetched_at" timestamp with time zone,
	"refresh_lease_until" timestamp with time zone,
	"refresh_not_before" timestamp with time zone,
	CONSTRAINT "streaming_provider_catalog_sync_country_code_kind_pk" PRIMARY KEY("country_code","kind"),
	CONSTRAINT "streaming_provider_catalog_sync_country_code_check" CHECK ("streaming_provider_catalog_sync"."country_code" ~ '^[A-Z]{2}$')
);
--> statement-breakpoint
CREATE TABLE "streaming_provider_regions" (
	"provider_id" uuid NOT NULL,
	"country_code" text NOT NULL,
	"kind" "media_kind" NOT NULL,
	"display_priority" integer NOT NULL,
	CONSTRAINT "streaming_provider_regions_provider_id_country_code_kind_pk" PRIMARY KEY("provider_id","country_code","kind"),
	CONSTRAINT "streaming_provider_regions_country_code_check" CHECK ("streaming_provider_regions"."country_code" ~ '^[A-Z]{2}$')
);
--> statement-breakpoint
CREATE TABLE "streaming_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tmdb_provider_id" integer NOT NULL,
	"name" text NOT NULL,
	"logo_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "streaming_providers_tmdb_provider_id_unique" UNIQUE("tmdb_provider_id")
);
--> statement-breakpoint
CREATE TABLE "user_streaming_providers" (
	"user_id" text NOT NULL,
	"provider_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_streaming_providers_user_id_provider_id_pk" PRIMARY KEY("user_id","provider_id")
);
--> statement-breakpoint
ALTER TABLE "media_availability_offers" ADD CONSTRAINT "media_availability_offers_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_availability_offers" ADD CONSTRAINT "media_availability_offers_provider_id_streaming_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."streaming_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_availability_sync" ADD CONSTRAINT "media_availability_sync_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaming_provider_regions" ADD CONSTRAINT "streaming_provider_regions_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."streaming_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaming_providers" ADD CONSTRAINT "user_streaming_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaming_providers" ADD CONSTRAINT "user_streaming_providers_provider_id_streaming_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."streaming_providers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "streaming_provider_regions_country_kind_idx" ON "streaming_provider_regions" USING btree ("country_code","kind");