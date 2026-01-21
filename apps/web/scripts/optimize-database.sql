-- Database Performance Optimization Script
-- Critical indexes for improving query performance

-- Missing indexes for user queries
-- These are essential for the main page feed performance

-- 1. OPTIMIZE RATINGS TABLE INDEXES
-- Index for finding ratings by user and media (faster profile lookups)
CREATE INDEX CONCURRENTLY IF NOT EXISTS ratings_user_media_idx 
ON ratings(user_id, media_id);

-- Index for ratings by media with timestamp (for movie detail pages)
CREATE INDEX CONCURRENTLY IF NOT EXISTS ratings_media_created_idx 
ON ratings(media_id, created_at DESC);

-- Composite index for feed queries (most critical)
CREATE INDEX CONCURRENTLY IF NOT EXISTS ratings_feed_idx 
ON ratings(user_id, created_at DESC, media_id);

-- 2. OPTIMIZE FOLLOWS TABLE INDEXES
-- Index for finding who a user follows (essential for feed generation)
CREATE INDEX CONCURRENTLY IF NOT EXISTS follows_follower_idx 
ON follows(follower_id, followee_id);

-- 3. OPTIMIZE FEED ITEMS TABLE INDEXES
-- Index for unseen feed items (notifications)
CREATE INDEX CONCURRENTLY IF NOT EXISTS feed_items_user_unseen_idx 
ON feed_items(user_id, seen_at NULLS FIRST, created_at DESC);

-- 4. OPTIMIZE MEDIA TABLE INDEXES
-- Index for TMDB lookups (critical for search performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS media_tmdb_idx 
ON media(tmdb_id, type);

-- Index for media by type and title (browse functionality)
CREATE INDEX CONCURRENTLY IF NOT EXISTS media_type_title_idx 
ON media(type, title);

-- 5. OPTIMIZE WATCHLIST INDEXES
-- Index for watchlist by user (profile pages)
CREATE INDEX CONCURRENTLY IF NOT EXISTS watchlist_user_idx 
ON watchlist(user_id, created_at DESC);

-- 6. OPTIMIZE NOTIFICATIONS INDEXES
-- Index for unread notifications count (nav badge)
CREATE INDEX CONCURRENTLY IF NOT EXISTS notifications_unread_count_idx 
ON notifications(recipient_id, read_at) WHERE is_deleted = false;

-- Index for notification list (notifications page)
CREATE INDEX CONCURRENTLY IF NOT EXISTS notifications_list_idx 
ON notifications(recipient_id, created_at DESC) 
WHERE is_deleted = false;

-- 7. OPTIMIZE USER SEARCH INDEXES
-- Index for username searches (user lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS users_username_idx 
ON users(username) WHERE username IS NOT NULL;

-- Index for user by email (login)
CREATE INDEX CONCURRENTLY IF NOT EXISTS users_email_idx 
ON users(email);

-- PARTIAL INDEXES for better performance on common queries

-- Only index ratings that are recent (most queries filter by recent)
CREATE INDEX CONCURRENTLY IF NOT EXISTS ratings_recent_idx 
ON ratings(user_id, created_at DESC) 
WHERE created_at > NOW() - INTERVAL '1 year';

-- Only index unseen notifications (most common case)
CREATE INDEX CONCURRENTLY IF NOT EXISTS notifications_unseen_partial_idx 
ON notifications(recipient_id, created_at DESC) 
WHERE read_at IS NULL AND is_deleted = false;

-- Optimized composite index for aggregated feed query
-- This matches the most expensive query pattern
CREATE INDEX CONCURRENTLY IF NOT EXISTS ratings_media_user_created_idx 
ON ratings(media_id, user_id, created_at DESC);

-- Query performance analysis
-- After creating indexes, analyze table statistics
ANALYZE ratings;
ANALYZE follows;
ANALYZE feed_items;
ANALYZE media;
ANALYZE watchlist;
ANALYZE notifications;
ANALYZE users;