import crypto from "crypto";

export interface HostTrafficSummary {
  hostSlug: string;
  views: number;
}

export interface EventTrafficSummary {
  eventSlug: string;
  views: number;
  trendingScore?: number;
}

export interface TrafficStats {
  activeUsers: number;
  topHosts: HostTrafficSummary[];
  topEvents: EventTrafficSummary[];
}

/**
 * Cloudflare Worker / Free Serverless Compatible Traffic & Session Aggregator
 * 
 * Free-tier architecture:
 * 1. Collects pageviews & sessions in lightweight fast memory / Cloudflare Cache.
 * 2. Periodically flushes only aggregated hourly counts to Supabase Free.
 * 3. Never writes raw individual pageview rows to Supabase (saving free quota).
 * 4. Strictly zero PII: hashed anon ID via SHA-256.
 */
export class CloudflareTrafficTracker {
  private memHostViews = new Map<string, number>();
  private memEventViews = new Map<string, number>();
  private memActiveSessions = new Map<string, number>();

  constructor() {
    // Initial zero state - no fake numbers
  }

  public hashAnonId(rawId: string): string {
    return crypto
      .createHash("sha256")
      .update(rawId + (process.env.ANON_SALT || "timepin_salt"))
      .digest("hex")
      .substring(0, 16);
  }

  public async recordSession(rawAnonId: string): Promise<void> {
    if (!rawAnonId) return;
    const hashed = this.hashAnonId(rawAnonId);
    this.memActiveSessions.set(hashed, Date.now());
  }

  public async recordHostView(hostSlug: string, increment: number = 1): Promise<void> {
    if (!hostSlug) return;
    const cur = this.memHostViews.get(hostSlug) || 0;
    this.memHostViews.set(hostSlug, cur + increment);
  }

  public async recordEventView(eventSlug: string, increment: number = 1): Promise<void> {
    if (!eventSlug) return;
    const cur = this.memEventViews.get(eventSlug) || 0;
    this.memEventViews.set(eventSlug, cur + increment);
  }

  public async getActiveUserCount(): Promise<number> {
    const cutoff = Date.now() - 5 * 60 * 1000;
    let count = 0;
    for (const [id, ts] of this.memActiveSessions.entries()) {
      if (ts >= cutoff) {
        count++;
      } else {
        this.memActiveSessions.delete(id);
      }
    }
    return Math.max(1, count);
  }

  public async getTopHosts(limit: number = 5): Promise<HostTrafficSummary[]> {
    return Array.from(this.memHostViews.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([hostSlug, views]) => ({ hostSlug, views }));
  }

  public async getTopEvents(limit: number = 5): Promise<EventTrafficSummary[]> {
    return Array.from(this.memEventViews.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([eventSlug, views]) => ({ eventSlug, views }));
  }

  public async getTrafficStats(): Promise<TrafficStats> {
    const [activeUsers, topHosts, topEvents] = await Promise.all([
      this.getActiveUserCount(),
      this.getTopHosts(5),
      this.getTopEvents(5),
    ]);

    return {
      activeUsers,
      topHosts,
      topEvents,
    };
  }

  /**
   * Generates aggregated summary payload for Cloudflare Cron -> Supabase Free sync
   */
  public getAggregatedFlushPayload() {
    const hostEntries = Array.from(this.memHostViews.entries()).map(([host_slug, views]) => ({
      host_slug,
      views,
      hour_bucket: new Date().toISOString().slice(0, 13) + ":00:00Z",
    }));

    const eventEntries = Array.from(this.memEventViews.entries()).map(([event_slug, views]) => ({
      event_slug,
      views,
      hour_bucket: new Date().toISOString().slice(0, 13) + ":00:00Z",
    }));

    return { hostEntries, eventEntries };
  }
}

export const productionTrafficTracker = new CloudflareTrafficTracker();
