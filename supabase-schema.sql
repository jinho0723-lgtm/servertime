-- =========================================================================
-- TIMEPIN Supabase Free Tier Schema (PostgreSQL)
-- Principles:
-- 1. 100% Guest Anonymous (No auth.users, No personal data, SHA-256 hashed anon IDs)
-- 2. Cloudflare Aggregated Stats (Zero per-request inserts; only aggregated flushes)
-- 3. Fits well within Supabase Free 500MB database quota
-- =========================================================================

-- 1. Hosts Table
CREATE TABLE IF NOT EXISTS public.hosts (
    slug VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    tag VARCHAR(32) DEFAULT 'WEB',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Events Table (Normalized Public Events)
CREATE TABLE IF NOT EXISTS public.events (
    id VARCHAR(128) PRIMARY KEY,
    slug VARCHAR(128) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    platform VARCHAR(64) NOT NULL,
    platform_name VARCHAR(128) NOT NULL,
    host_slug VARCHAR(64) REFERENCES public.hosts(slug),
    open_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(64) DEFAULT 'Asia/Seoul',
    status VARCHAR(32) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'OPEN', 'CLOSED'
    source_type VARCHAR(64) NOT NULL, -- 'SCRAPER', 'PUBLIC_PAGE', 'OFFICIAL_API'
    source_url TEXT,
    image_url TEXT,
    venue VARCHAR(255),
    confidence_score NUMERIC(4, 2) DEFAULT 0.90,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_open_at ON public.events (open_at);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events (category);

-- 3. Event Sources Metadata
CREATE TABLE IF NOT EXISTS public.event_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adapter_name VARCHAR(128) NOT NULL,
    platform VARCHAR(64) NOT NULL,
    target_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Traffic Aggregated Stats (Hourly Rollups only - NEVER per-pageview)
CREATE TABLE IF NOT EXISTS public.host_stats_hourly (
    id BIGSERIAL PRIMARY KEY,
    host_slug VARCHAR(64) NOT NULL,
    hour_bucket TIMESTAMPTZ NOT NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(host_slug, hour_bucket)
);

CREATE TABLE IF NOT EXISTS public.event_stats_hourly (
    id BIGSERIAL PRIMARY KEY,
    event_slug VARCHAR(128) NOT NULL,
    hour_bucket TIMESTAMPTZ NOT NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_slug, hour_bucket)
);

-- 5. Anonymous Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(32) NOT NULL, -- 'tip', 'review', 'qna'
    title VARCHAR(128) NOT NULL,
    content TEXT NOT NULL,
    author_nickname VARCHAR(64) NOT NULL,
    hashed_anon_id VARCHAR(64) NOT NULL, -- SHA-256 (Never raw IP or cookie)
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts (created_at DESC);

-- 6. Ticket Success Proof Posts
CREATE TABLE IF NOT EXISTS public.success_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(128) NOT NULL,
    seat_info VARCHAR(128) NOT NULL,
    server_used VARCHAR(64) NOT NULL,
    author_nickname VARCHAR(64) NOT NULL,
    hashed_anon_id VARCHAR(64) NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Ingestion Audit Logs
CREATE TABLE IF NOT EXISTS public.ingestion_logs (
    id BIGSERIAL PRIMARY KEY,
    adapter_name VARCHAR(128) NOT NULL,
    total_fetched INT DEFAULT 0,
    total_normalized INT DEFAULT 0,
    published_count INT DEFAULT 0,
    status VARCHAR(32) NOT NULL, -- 'SUCCESS', 'ANOMALY', 'BLOCKED'
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_stats_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_stats_hourly ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies
CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public Read Hosts" ON public.hosts FOR SELECT USING (true);
CREATE POLICY "Public Read Community" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Public Read Success" ON public.success_posts FOR SELECT USING (true);

-- 2. Strictly Block Arbitrary UPDATE and DELETE on Community & Success Posts
-- By default RLS denies any operation with no matching policy. We explicitly document:
-- No UPDATE policy defined -> Direct client UPDATE is 100% BLOCKED.
-- No DELETE policy defined -> Direct client DELETE is 100% BLOCKED.

-- 3. Anonymous INSERT Policy with Sanitization Constraints
CREATE POLICY "Anon Insert Community" ON public.community_posts 
    FOR INSERT 
    WITH CHECK (
        length(title) > 0 AND length(title) <= 80
        AND length(content) > 0 AND length(content) <= 500
        AND length(author_nickname) > 0 AND length(author_nickname) <= 32
        AND length(hashed_anon_id) = 16
    );

CREATE POLICY "Anon Insert Success" ON public.success_posts 
    FOR INSERT 
    WITH CHECK (
        length(event_name) > 0 AND length(event_name) <= 60
        AND length(seat_info) > 0 AND length(seat_info) <= 60
        AND length(author_nickname) > 0 AND length(author_nickname) <= 32
        AND length(hashed_anon_id) = 16
    );

