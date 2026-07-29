-- Keep the legacy source stable while deriving the historical projection.
LOCK TABLE "ratings", "feed_items" IN SHARE MODE;--> statement-breakpoint

DO $$
DECLARE
  actor_mismatch_count bigint;
  duplicate_row_count bigint;
BEGIN
  SELECT count(*)
  INTO actor_mismatch_count
  FROM "feed_items" f
  JOIN "ratings" r ON r."id" = f."rating_id"
  WHERE f."actor_id" <> r."user_id";

  IF actor_mismatch_count > 0 THEN
    RAISE EXCEPTION
      'Cannot backfill activities: % feed items have an actor different from the rating owner',
      actor_mismatch_count;
  END IF;

  SELECT count(*) - count(DISTINCT ("user_id", "rating_id"))
  INTO duplicate_row_count
  FROM "feed_items";

  RAISE NOTICE 'Activity feed backfill will collapse % duplicate feed item rows', duplicate_row_count;
END
$$;--> statement-breakpoint

WITH "first_delivery" AS (
  SELECT
    "rating_id",
    min("created_at") AS "occurred_at"
  FROM "feed_items"
  GROUP BY "rating_id"
)
INSERT INTO "activities" (
  "type_code",
  "actor_id",
  "occurred_at",
  "payload",
  "deduplication_key"
)
SELECT
  'rating.created',
  r."user_id",
  CASE
    WHEN fd."occurred_at" IS NULL THEN r."created_at"
    ELSE least(r."created_at", fd."occurred_at")
  END,
  '{}'::jsonb,
  'rating.created:' || r."id"::text
FROM "ratings" r
LEFT JOIN "first_delivery" fd ON fd."rating_id" = r."id"
ON CONFLICT ("deduplication_key") DO NOTHING;--> statement-breakpoint

INSERT INTO "rating_activities" ("activity_id", "rating_id")
SELECT a."id", r."id"
FROM "ratings" r
JOIN "activities" a
  ON a."deduplication_key" = 'rating.created:' || r."id"::text
ON CONFLICT DO NOTHING;--> statement-breakpoint

WITH "canonical_delivery" AS (
  SELECT DISTINCT ON (f."user_id", f."rating_id")
    f."id",
    f."user_id" AS "feed_owner_id",
    f."rating_id"
  FROM "feed_items" f
  ORDER BY f."user_id", f."rating_id", f."created_at", f."id"
),
"delivery_state" AS (
  SELECT
    f."user_id" AS "feed_owner_id",
    f."rating_id",
    min(f."created_at") AS "delivered_at",
    min(f."seen_at") FILTER (WHERE f."seen_at" IS NOT NULL) AS "seen_at"
  FROM "feed_items" f
  GROUP BY f."user_id", f."rating_id"
)
INSERT INTO "feed_deliveries" (
  "id",
  "feed_owner_id",
  "activity_id",
  "occurred_at",
  "delivered_at",
  "seen_at"
)
SELECT
  cd."id",
  cd."feed_owner_id",
  ra."activity_id",
  a."occurred_at",
  ds."delivered_at",
  ds."seen_at"
FROM "canonical_delivery" cd
JOIN "delivery_state" ds
  ON ds."feed_owner_id" = cd."feed_owner_id"
  AND ds."rating_id" = cd."rating_id"
JOIN "rating_activities" ra ON ra."rating_id" = cd."rating_id"
JOIN "activities" a ON a."id" = ra."activity_id"
ON CONFLICT DO NOTHING;--> statement-breakpoint

DO $$
DECLARE
  rating_count bigint;
  rating_activity_count bigint;
  expected_delivery_count bigint;
  delivery_count bigint;
  invalid_actor_count bigint;
  invalid_occurred_at_count bigint;
BEGIN
  SELECT count(*) INTO rating_count FROM "ratings";
  SELECT count(*) INTO rating_activity_count FROM "rating_activities";
  SELECT count(*)
  INTO expected_delivery_count
  FROM (
    SELECT DISTINCT "user_id", "rating_id"
    FROM "feed_items"
  ) expected_deliveries;
  SELECT count(*) INTO delivery_count FROM "feed_deliveries";

  SELECT count(*)
  INTO invalid_actor_count
  FROM "rating_activities" ra
  JOIN "ratings" r ON r."id" = ra."rating_id"
  JOIN "activities" a ON a."id" = ra."activity_id"
  WHERE a."actor_id" <> r."user_id"
    OR a."type_code" <> 'rating.created';

  SELECT count(*)
  INTO invalid_occurred_at_count
  FROM "feed_deliveries" fd
  JOIN "activities" a ON a."id" = fd."activity_id"
  WHERE fd."occurred_at" <> a."occurred_at";

  IF rating_activity_count <> rating_count THEN
    RAISE EXCEPTION
      'Activity feed backfill validation failed: expected % rating activities, found %',
      rating_count,
      rating_activity_count;
  END IF;

  IF delivery_count <> expected_delivery_count THEN
    RAISE EXCEPTION
      'Activity feed backfill validation failed: expected % deliveries, found %',
      expected_delivery_count,
      delivery_count;
  END IF;

  IF invalid_actor_count > 0 THEN
    RAISE EXCEPTION
      'Activity feed backfill validation failed: % rating activities have invalid actors or types',
      invalid_actor_count;
  END IF;

  IF invalid_occurred_at_count > 0 THEN
    RAISE EXCEPTION
      'Activity feed backfill validation failed: % deliveries differ from their activity occurred_at',
      invalid_occurred_at_count;
  END IF;

  RAISE NOTICE
    'Activity feed backfill complete: % ratings, % rating activities, % deliveries',
    rating_count,
    rating_activity_count,
    delivery_count;
END
$$;
