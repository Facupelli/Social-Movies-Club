import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/* ------------------------------------------------------------------ *
 *  BETTER AUTH                                                              *
 * ------------------------------------------------------------------ */

export const users = pgTable(
  'users',
  {
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
  },
  (table) => [index('users_email_idx').on(table.email)]
);

export type User = typeof users.$inferSelect;

export const userProfiles = pgTable(
  'user_profiles',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    username: text('username'),
    displayName: text('display_name').notNull(),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    countryCode: text('country_code'),
    onboardingCompletedAt: timestamp('onboarding_completed_at', {
      withTimezone: true,
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_profiles_username_lower_unique')
      .on(sql`lower(${table.username})`)
      .where(sql`${table.username} IS NOT NULL`),
    check(
      'user_profiles_country_code_check',
      sql`${table.countryCode} IS NULL OR ${table.countryCode} ~ '^[A-Z]{2}$'`
    ),
  ]
);

export type UserProfile = typeof userProfiles.$inferSelect;

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
 *  Media                                                             *
 * ------------------------------------------------------------------ */

export const mediaKindEnum = pgEnum('media_kind', ['movie', 'tv_series']);

export const media = pgTable(
  'media',
  {
    id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
    kind: mediaKindEnum('kind').notNull(),
    title: text('title').notNull(),
    originalTitle: text('original_title'),
    releaseDate: date('release_date'),
    runtimeMinutes: integer('runtime_minutes'),
    overview: text('overview'),
    posterPath: text('poster_path'),
    backdropPath: text('backdrop_path'),
    sourceSyncedAt: timestamp('source_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('media_kind_title_idx').on(table.kind, table.title)]
);

export type Media = typeof media.$inferSelect;

export const mediaExternalIds = pgTable(
  'media_external_ids',
  {
    mediaId: uuid('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    namespace: text('namespace').notNull(),
    externalId: text('external_id').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.mediaId, table.namespace] }),
    unique('media_external_ids_namespace_external_id_unique').on(
      table.namespace,
      table.externalId
    ),
  ]
);

export type MediaExternalId = typeof mediaExternalIds.$inferSelect;

/* ------------------------------------------------------------------ *
 *  ratings                                                            *
 *  - a user can rate media once                                     *
 * ------------------------------------------------------------------ */

export const ratings = pgTable(
  'ratings',
  {
    id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    score: smallint('score').notNull(),
    watchedDate: date('watched_date'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('ratings_user_media_unique').on(table.userId, table.mediaId),
    check('ratings_score_range_check', sql`${table.score} BETWEEN 1 AND 10`),
    check(
      'ratings_watched_date_not_future_check',
      sql`${table.watchedDate} <= CURRENT_DATE`
    ),
    index('ratings_profile_idx').on(table.userId, table.createdAt),
    // Performance optimization indexes
    index('ratings_user_media_idx').on(table.userId, table.mediaId),
    index('ratings_media_created_idx').on(table.mediaId, table.createdAt),
    index('ratings_feed_idx').on(table.userId, table.createdAt, table.mediaId),
    index('ratings_media_user_created_idx').on(
      table.mediaId,
      table.userId,
      table.createdAt
    ),
    // Index for recent ratings queries
    index('ratings_recent_idx').on(table.userId, table.createdAt),
  ]
);

export type Rating = typeof ratings.$inferSelect;

/* ------------------------------------------------------------------ *
 *  activities                                                         *
 * ------------------------------------------------------------------ */

export const activities = pgTable(
  'activities',
  {
    id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
    typeCode: text('type_code').notNull(),
    actorId: text('actor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    payload: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    deduplicationKey: text('deduplication_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('activities_deduplication_key_unique').on(table.deduplicationKey),
    index('activities_occurred_at_idx').on(
      table.occurredAt.desc(),
      table.id.desc()
    ),
  ]
);

export type Activity = typeof activities.$inferSelect;

export const ratingActivities = pgTable(
  'rating_activities',
  {
    activityId: uuid('activity_id')
      .primaryKey()
      .references(() => activities.id, { onDelete: 'cascade' }),
    ratingId: uuid('rating_id')
      .notNull()
      .references(() => ratings.id, { onDelete: 'restrict' }),
  },
  (table) => [unique('rating_activities_rating_id_unique').on(table.ratingId)]
);

export const feedDeliveries = pgTable(
  'feed_deliveries',
  {
    id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
    feedOwnerId: text('feed_owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    activityId: uuid('activity_id')
      .notNull()
      .references(() => activities.id, { onDelete: 'cascade' }),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    deliveredAt: timestamp('delivered_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    seenAt: timestamp('seen_at', { withTimezone: true }),
  },
  (table) => [
    unique('feed_deliveries_owner_activity_unique').on(
      table.feedOwnerId,
      table.activityId
    ),
    index('feed_deliveries_activity_idx').on(table.activityId),
    index('feed_deliveries_owner_timeline_idx').on(
      table.feedOwnerId,
      table.occurredAt.desc(),
      table.id.desc()
    ),
  ]
);

export type FeedDelivery = typeof feedDeliveries.$inferSelect;

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
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followeeId] }),
    check(
      'follows_no_self_follow_check',
      sql`${table.followerId} <> ${table.followeeId}`
    ),
    index('follows_reverse_idx').on(table.followeeId),
    // Performance optimization for feed generation
    index('follows_follower_idx').on(table.followerId, table.followeeId),
  ]
);

export type Follow = typeof follows.$inferSelect;

/* ------------------------------------------------------------------ *
 *  watchlist
 *
 * ------------------------------------------------------------------ */

export const watchlist = pgTable(
  'watchlist',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('watchlist_user_media_unique').on(table.userId, table.mediaId),
    index('watchlist_profile_idx').on(table.userId, table.createdAt),
    // Performance optimization
    index('watchlist_user_idx').on(table.userId, table.createdAt),
  ]
);

/* ------------------------------------------------------------------ *
 *  notifications
 *
 * ------------------------------------------------------------------ */

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    recipientId: text('recipient_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    actorId: text('actor_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    typeCode: text('type_code').notNull(),
    data: jsonb('data')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('notifications_list_idx').on(
      table.recipientId,
      table.createdAt,
      table.id
    ),
    index('notifications_unread_count_idx')
      .on(table.recipientId, table.readAt)
      .where(sql`read_at IS NULL`),
    index('notifications_actor_created_idx').on(table.actorId, table.createdAt),
    index('notifications_type_created_idx').on(table.typeCode, table.createdAt),
  ]
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

/* ------------------------------------------------------------------ *
 *  Streaming availability                                            *
 *  - streaming_providers + regions + offers are derived from TMDB    *
 *  - user_streaming_providers is authoritative user data             *
 * ------------------------------------------------------------------ */

export const streamingProviders = pgTable('streaming_providers', {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  tmdbProviderId: integer('tmdb_provider_id').notNull().unique(),
  name: text('name').notNull(),
  logoPath: text('logo_path'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type StreamingProvider = typeof streamingProviders.$inferSelect;

export const streamingProviderRegions = pgTable(
  'streaming_provider_regions',
  {
    providerId: uuid('provider_id').notNull(),
    countryCode: text('country_code').notNull(),
    kind: mediaKindEnum('kind').notNull(),
    displayPriority: integer('display_priority').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.providerId, table.countryCode, table.kind] }),
    check(
      'streaming_provider_regions_country_code_check',
      sql`${table.countryCode} ~ '^[A-Z]{2}$'`
    ),
    index('streaming_provider_regions_country_kind_idx').on(
      table.countryCode,
      table.kind
    ),
    foreignKey({
      name: 'streaming_provider_regions_provider_id_fk',
      columns: [table.providerId],
      foreignColumns: [streamingProviders.id],
    }).onDelete('cascade'),
  ]
);

export type StreamingProviderRegion =
  typeof streamingProviderRegions.$inferSelect;

export const streamingProviderCatalogSync = pgTable(
  'streaming_provider_catalog_sync',
  {
    countryCode: text('country_code').primaryKey(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }),
    refreshLeaseUntil: timestamp('refresh_lease_until', { withTimezone: true }),
  },
  (table) => [
    check(
      'streaming_provider_catalog_sync_country_code_check',
      sql`${table.countryCode} ~ '^[A-Z]{2}$'`
    ),
  ]
);

export type StreamingProviderCatalogSync =
  typeof streamingProviderCatalogSync.$inferSelect;

export const userStreamingProviders = pgTable(
  'user_streaming_providers',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerId: uuid('provider_id')
      .notNull()
      .references(() => streamingProviders.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.providerId] })]
);

export type UserStreamingProvider = typeof userStreamingProviders.$inferSelect;

export const mediaAvailabilitySync = pgTable('media_availability_sync', {
  mediaId: uuid('media_id')
    .primaryKey()
    .references(() => media.id, { onDelete: 'cascade' }),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }),
  refreshLeaseUntil: timestamp('refresh_lease_until', { withTimezone: true }),
});

export type MediaAvailabilitySync = typeof mediaAvailabilitySync.$inferSelect;

export const mediaAvailabilityOffers = pgTable(
  'media_availability_offers',
  {
    mediaId: uuid('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    countryCode: text('country_code').notNull(),
    providerId: uuid('provider_id')
      .notNull()
      .references(() => streamingProviders.id, { onDelete: 'cascade' }),
    monetizationType: text('monetization_type').notNull(),
  },
  (table) => [
    unique('media_availability_offers_unique').on(
      table.mediaId,
      table.countryCode,
      table.providerId,
      table.monetizationType
    ),
    check(
      'media_availability_offers_country_code_check',
      sql`${table.countryCode} ~ '^[A-Z]{2}$'`
    ),
  ]
);

export type MediaAvailabilityOffer =
  typeof mediaAvailabilityOffers.$inferSelect;
