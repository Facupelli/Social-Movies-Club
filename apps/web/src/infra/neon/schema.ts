import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

/* ------------------------------------------------------------------ *
 *  BETTER AUTH                                                              *
 * ------------------------------------------------------------------ */

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),

  /* Your domain-specific columns */
  username: text('username').unique(),
});

export type User = typeof users.$inferSelect;

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp('updated_at').$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

/* ------------------------------------------------------------------ *
 *  movies                                                             *
 * ------------------------------------------------------------------ */

export const movies = pgTable('movies', {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  tmdbId: integer('tmdb_id').unique().notNull(),
  title: text('title').notNull(),
  year: text('year').notNull(),
  posterPath: text('poster_path').notNull(),
});

export type Movie = typeof movies.$inferSelect;

/* ------------------------------------------------------------------ *
 *  ratings                                                            *
 *  - a user can rate a movie once                                     *
 * ------------------------------------------------------------------ */

export const ratings = pgTable(
  'ratings',
  {
    id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    movieId: uuid('movie_id')
      .notNull()
      .references(() => movies.id, { onDelete: 'cascade' }),
    score: smallint('score').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('ratings_user_movie_unique').on(table.userId, table.movieId),
    index('ratings_profile_idx').on(table.userId, table.createdAt),
  ]
);

export type Rating = typeof ratings.$inferSelect;

/* ------------------------------------------------------------------ *
 *  follows (directed edge)                                            *
 * ------------------------------------------------------------------ */

export const follows = pgTable(
  'follows',
  {
    followerId: text('follower_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followeeId: text('followee_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followeeId] }),
    index('follows_reverse_idx').on(table.followeeId),
  ]
);

export type Follow = typeof follows.$inferSelect;

/* ------------------------------------------------------------------ *
 *  feed                                             *
 *
 *  PUSH MODEL (Fan-out on Write)
 * ------------------------------------------------------------------ */

export const feedItems = pgTable(
  'feed_items',
  {
    id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
    userId: text('user_id') // owner of the feed
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    actorId: text('actor_id') // who performed the action
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ratingId: uuid('rating_id')
      .notNull()
      .references(() => ratings.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    seenAt: timestamp('seen_at', { withTimezone: true }), // null = unseen
  },
  (table) => [
    index('feed_items_user_time_idx').on(table.userId, table.createdAt),
    index('feed_items_unseen_idx').on(table.userId, table.seenAt),
  ]
);
