DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "follows"
    WHERE "follower_id" = "followee_id"
  ) THEN
    RAISE EXCEPTION 'Cannot prevent self-follows while existing self-follow rows remain';
  END IF;
END
$$;
