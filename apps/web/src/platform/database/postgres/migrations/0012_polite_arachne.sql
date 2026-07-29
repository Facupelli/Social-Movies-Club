CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"username" text,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"bio" text,
	"country_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_country_code_check" CHECK ("user_profiles"."country_code" IS NULL OR "user_profiles"."country_code" ~ '^[A-Z]{2}$')
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "user_profiles" (
  "user_id",
  "username",
  "display_name",
  "avatar_url",
  "created_at",
  "updated_at"
)
SELECT "id", "username", "name", "image", "created_at", "updated_at"
FROM "users";--> statement-breakpoint
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM "user_profiles") <> (SELECT COUNT(*) FROM "users") THEN
    RAISE EXCEPTION 'Profile backfill did not create exactly one profile per user';
  END IF;
END
$$;--> statement-breakpoint
CREATE UNIQUE INDEX "user_profiles_username_lower_unique" ON "user_profiles" USING btree (lower("username")) WHERE "user_profiles"."username" IS NOT NULL;--> statement-breakpoint
CREATE FUNCTION "create_user_profile"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO "user_profiles" (
    "user_id",
    "display_name",
    "avatar_url",
    "created_at",
    "updated_at"
  )
  VALUES (NEW."id", NEW."name", NEW."image", NEW."created_at", NEW."updated_at");

  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "users_create_profile_after_insert"
AFTER INSERT ON "users"
FOR EACH ROW
EXECUTE FUNCTION "create_user_profile"();--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
DROP INDEX "users_username_idx";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "username";