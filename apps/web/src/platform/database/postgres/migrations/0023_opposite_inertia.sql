-- Existing per-kind timestamps cannot prove that a complete country catalogue was
-- fetched. Force the first country-level read to refresh both kinds together.
DELETE FROM "streaming_provider_catalog_sync";--> statement-breakpoint
ALTER TABLE "streaming_provider_catalog_sync" DROP CONSTRAINT "streaming_provider_catalog_sync_country_code_kind_pk";--> statement-breakpoint
ALTER TABLE "streaming_provider_catalog_sync" ADD PRIMARY KEY ("country_code");--> statement-breakpoint
ALTER TABLE "media_availability_sync" DROP COLUMN "refresh_not_before";--> statement-breakpoint
ALTER TABLE "streaming_provider_catalog_sync" DROP COLUMN "kind";--> statement-breakpoint
ALTER TABLE "streaming_provider_catalog_sync" DROP COLUMN "refresh_not_before";