INSERT INTO "notification_types" ("id", "name", "template", "is_active")
VALUES ('user_follow', 'Nuevo seguidor', '{actor} ahora te sigue', true)
ON CONFLICT ("id") DO NOTHING;
