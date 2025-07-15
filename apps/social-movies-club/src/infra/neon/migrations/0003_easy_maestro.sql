ALTER TABLE "ratings" DROP CONSTRAINT "ratings_user_id_movie_id_pk";--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_movie_unique" UNIQUE("user_id","movie_id");