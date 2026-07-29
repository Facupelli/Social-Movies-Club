-- Capture legacy feed writes that landed after the initial historical backfill.
-- The locks provide one stable source snapshot and block rating/feed writes only for
-- the duration of this transaction. Reads remain available.
LOCK TABLE "ratings", "feed_items" IN SHARE MODE;--> statement-breakpoint

DO $$
DECLARE
  actor_mismatch_count bigint;
  invalid_activity_count bigint;
  invalid_reference_count bigint;
  conflicting_delivery_id_count bigint;
  duplicate_legacy_row_count bigint;
  missing_rating_count bigint;
  missing_delivery_count bigint;
BEGIN
  SELECT count(*)
  INTO actor_mismatch_count
  FROM "feed_items" f
  JOIN "ratings" r ON r."id" = f."rating_id"
  WHERE f."actor_id" <> r."user_id";

  SELECT count(*)
  INTO invalid_activity_count
  FROM "ratings" r
  JOIN "activities" a
    ON a."deduplication_key" = 'rating.created:' || r."id"::text
  WHERE a."type_code" <> 'rating.created'
     OR a."actor_id" <> r."user_id";

  SELECT count(*)
  INTO invalid_reference_count
  FROM "rating_activities" ra
  JOIN "ratings" r ON r."id" = ra."rating_id"
  JOIN "activities" a ON a."id" = ra."activity_id"
  WHERE a."deduplication_key" <> 'rating.created:' || r."id"::text
     OR a."type_code" <> 'rating.created'
     OR a."actor_id" <> r."user_id";

  WITH "canonical_delivery" AS (
    SELECT DISTINCT ON (f."user_id", f."rating_id")
      f."id",
      f."user_id" AS "feed_owner_id",
      f."rating_id"
    FROM "feed_items" f
    ORDER BY f."user_id", f."rating_id", f."created_at", f."id"
  ),
  "missing_delivery" AS (
    SELECT cd."id", cd."feed_owner_id", ra."activity_id"
    FROM "canonical_delivery" cd
    JOIN "rating_activities" ra ON ra."rating_id" = cd."rating_id"
    LEFT JOIN "feed_deliveries" expected
      ON expected."feed_owner_id" = cd."feed_owner_id"
      AND expected."activity_id" = ra."activity_id"
    WHERE expected."id" IS NULL
  )
  SELECT count(*)
  INTO conflicting_delivery_id_count
  FROM "missing_delivery" md
  JOIN "feed_deliveries" occupied ON occupied."id" = md."id"
  WHERE occupied."feed_owner_id" <> md."feed_owner_id"
     OR occupied."activity_id" <> md."activity_id";

  SELECT count(*) - count(DISTINCT ("user_id", "rating_id"))
  INTO duplicate_legacy_row_count
  FROM "feed_items";

  SELECT count(*)
  INTO missing_rating_count
  FROM "ratings" r
  LEFT JOIN "rating_activities" ra ON ra."rating_id" = r."id"
  WHERE ra."rating_id" IS NULL;

  SELECT count(*)
  INTO missing_delivery_count
  FROM (
    SELECT DISTINCT f."user_id", f."rating_id"
    FROM "feed_items" f
  ) expected
  LEFT JOIN "rating_activities" ra ON ra."rating_id" = expected."rating_id"
  LEFT JOIN "feed_deliveries" fd
    ON fd."feed_owner_id" = expected."user_id"
    AND fd."activity_id" = ra."activity_id"
  WHERE fd."id" IS NULL;

  IF actor_mismatch_count > 0 THEN
    RAISE EXCEPTION
      'Activity feed catch-up refused: % legacy feed rows have an actor different from the rating owner',
      actor_mismatch_count;
  END IF;

  IF invalid_activity_count > 0 THEN
    RAISE EXCEPTION
      'Activity feed catch-up refused: % deduplicated activities have an invalid actor or type',
      invalid_activity_count;
  END IF;

  IF invalid_reference_count > 0 THEN
    RAISE EXCEPTION
      'Activity feed catch-up refused: % rating activity references are invalid',
      invalid_reference_count;
  END IF;

  IF conflicting_delivery_id_count > 0 THEN
    RAISE EXCEPTION
      'Activity feed catch-up refused: % canonical legacy delivery IDs are occupied by another delivery',
      conflicting_delivery_id_count;
  END IF;

  RAISE NOTICE
    'Activity feed catch-up starting: % missing rating projections, % missing legacy deliveries, % duplicate legacy rows',
    missing_rating_count,
    missing_delivery_count,
    duplicate_legacy_row_count;
END
$$;--> statement-breakpoint

WITH "first_delivery" AS (
  SELECT "rating_id", min("created_at") AS "occurred_at"
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
LEFT JOIN "activities" existing
  ON existing."deduplication_key" = 'rating.created:' || r."id"::text
WHERE existing."id" IS NULL
ON CONFLICT ("deduplication_key") DO NOTHING;--> statement-breakpoint

INSERT INTO "rating_activities" ("activity_id", "rating_id")
SELECT a."id", r."id"
FROM "ratings" r
JOIN "activities" a
  ON a."deduplication_key" = 'rating.created:' || r."id"::text
LEFT JOIN "rating_activities" existing ON existing."rating_id" = r."id"
WHERE existing."rating_id" IS NULL
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
LEFT JOIN "feed_deliveries" existing
  ON existing."feed_owner_id" = cd."feed_owner_id"
  AND existing."activity_id" = ra."activity_id"
WHERE existing."id" IS NULL
ON CONFLICT DO NOTHING;--> statement-breakpoint

DO $$
DECLARE
  rating_count bigint;
  rating_activity_count bigint;
  legacy_row_count bigint;
  expected_legacy_delivery_count bigint;
  delivery_count bigint;
  missing_legacy_delivery_count bigint;
  duplicate_delivery_count bigint;
  invalid_actor_count bigint;
  invalid_occurred_at_count bigint;
  invalid_activity_count bigint;
BEGIN
  SELECT count(*) INTO rating_count FROM "ratings";
  SELECT count(*) INTO rating_activity_count FROM "rating_activities";
  SELECT count(*) INTO legacy_row_count FROM "feed_items";
  SELECT count(*)
  INTO expected_legacy_delivery_count
  FROM (SELECT DISTINCT "user_id", "rating_id" FROM "feed_items") expected;
  SELECT count(*) INTO delivery_count FROM "feed_deliveries";

  SELECT count(*)
  INTO missing_legacy_delivery_count
  FROM (
    SELECT DISTINCT f."user_id", f."rating_id"
    FROM "feed_items" f
  ) expected
  JOIN "rating_activities" ra ON ra."rating_id" = expected."rating_id"
  LEFT JOIN "feed_deliveries" fd
    ON fd."feed_owner_id" = expected."user_id"
    AND fd."activity_id" = ra."activity_id"
  WHERE fd."id" IS NULL;

  SELECT count(*)
  INTO duplicate_delivery_count
  FROM (
    SELECT "feed_owner_id", "activity_id"
    FROM "feed_deliveries"
    GROUP BY "feed_owner_id", "activity_id"
    HAVING count(*) > 1
  ) duplicates;

  SELECT count(*)
  INTO invalid_actor_count
  FROM "rating_activities" ra
  JOIN "ratings" r ON r."id" = ra."rating_id"
  JOIN "activities" a ON a."id" = ra."activity_id"
  WHERE a."actor_id" <> r."user_id";

  SELECT count(*)
  INTO invalid_occurred_at_count
  FROM "feed_deliveries" fd
  JOIN "activities" a ON a."id" = fd."activity_id"
  WHERE fd."occurred_at" <> a."occurred_at";

  SELECT count(*)
  INTO invalid_activity_count
  FROM "rating_activities" ra
  JOIN "ratings" r ON r."id" = ra."rating_id"
  JOIN "activities" a ON a."id" = ra."activity_id"
  WHERE a."type_code" <> 'rating.created'
     OR a."deduplication_key" <> 'rating.created:' || r."id"::text;

  IF rating_activity_count <> rating_count THEN
    RAISE EXCEPTION
      'Activity feed catch-up validation failed: expected % rating activities, found %',
      rating_count,
      rating_activity_count;
  END IF;

  IF missing_legacy_delivery_count > 0 THEN
    RAISE EXCEPTION
      'Activity feed catch-up validation failed: % distinct legacy recipient/rating pairs have no delivery',
      missing_legacy_delivery_count;
  END IF;

  IF duplicate_delivery_count > 0 THEN
    RAISE EXCEPTION
      'Activity feed catch-up validation failed: % duplicate delivery groups found',
      duplicate_delivery_count;
  END IF;

  IF invalid_actor_count > 0 OR invalid_activity_count > 0 THEN
    RAISE EXCEPTION
      'Activity feed catch-up validation failed: % actor mismatches and % invalid rating activities',
      invalid_actor_count,
      invalid_activity_count;
  END IF;

  IF invalid_occurred_at_count > 0 THEN
    RAISE EXCEPTION
      'Activity feed catch-up validation failed: % deliveries differ from their activity occurred_at',
      invalid_occurred_at_count;
  END IF;

  RAISE NOTICE
    'Activity feed catch-up complete: % ratings, % rating activities, % legacy rows, % distinct legacy pairs, % deliveries',
    rating_count,
    rating_activity_count,
    legacy_row_count,
    expected_legacy_delivery_count,
    delivery_count;
END
$$;
