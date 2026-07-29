ALTER TYPE "public"."media_type" RENAME VALUE 'tv' TO 'tv_series';
--> statement-breakpoint
CREATE TABLE "media_external_ids" (
	"media_id" uuid NOT NULL,
	"namespace" text NOT NULL,
	"external_id" text NOT NULL,
	CONSTRAINT "media_external_ids_media_id_namespace_pk" PRIMARY KEY("media_id","namespace"),
	CONSTRAINT "media_external_ids_namespace_external_id_unique" UNIQUE("namespace","external_id")
);
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "kind" "media_type";
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "original_title" text;
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "release_date" date;
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "runtime_minutes" integer;
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "source_synced_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
UPDATE "media"
SET
	"kind" = "type",
	"runtime_minutes" = "runtime";
--> statement-breakpoint
INSERT INTO "media_external_ids" ("media_id", "namespace", "external_id")
SELECT
	"id",
	CASE "type"
		WHEN 'movie' THEN 'tmdb:movie'
		WHEN 'tv_series' THEN 'tmdb:tv'
	END,
	"tmdb_id"::text
FROM "media";
--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "kind" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "poster_path" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "backdrop_path" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "overview" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "media_external_ids" ADD CONSTRAINT "media_external_ids_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "media" DROP CONSTRAINT "media_tmdb_id_type_unique";
--> statement-breakpoint
DROP INDEX "media_tmdb_idx";
--> statement-breakpoint
DROP INDEX "media_type_title_idx";
--> statement-breakpoint
CREATE INDEX "media_kind_title_idx" ON "media" USING btree ("kind","title");
--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "tmdb_id";
--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "type";
--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "year";
--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "runtime";
