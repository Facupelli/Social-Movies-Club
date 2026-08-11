-- Backfill existing profiles as onboarding-complete so they are not
-- redirected into the new onboarding flow.
UPDATE "user_profiles"
SET "onboarding_completed_at" = NOW()
WHERE "onboarding_completed_at" IS NULL;
