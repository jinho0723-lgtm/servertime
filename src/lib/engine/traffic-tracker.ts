interface ViewTrafficRecord {
  hostSlug: string;
  count: number;
  lastViewedAt: number;
}

interface EventTrafficRecord {
  eventSlug: string;
  count: number;
  lastViewedAt: number;
}

class InternalTrafficTracker {
  private hostViews = new Map<string, ViewTrafficRecord>();
  private eventViews = new Map<string, EventTrafficRecord>();
  private activeSessions = new Map<string, number>(); // anonId -> timestamp

  // Default initial seeds based on standard verified domains
  constructor() {
    this.recordHostView("interpark", 142);
    this.recordHostView("yes24", 98);
    this.recordHostView("ticketlink", 45);
    this.recordHostView("melon", 39);
    this.recordHostView("naver-booking", 31);
    this.recordHostView("catchtable", 25);
  }

  public recordSession(anonId: string) {
    if (!anonId) return;
    this.activeSessions.set(anonId, Date.now());
  }

  public getActiveUserCount(): number {
    const cutoff = Date.now() - 5 * 60 * 1000; // active in last 5 minutes
    let count = 0;
    for (const [id, ts] of this.activeSessions.entries()) {
      if (ts >= cutoff) {
        count++;
      } else {
        this.activeSessions.delete(id);
      }
    }
    return Math.max(1, count);
  }

  public recordHostView(hostSlug: string, increment: number = 1) {
    const existing = this.hostViews.get(hostSlug);
    const now = Date.now();
    if (existing) {
      existing.count += increment;
      existing.lastViewedAt = now;
    } else {
      this.hostViews.set(hostSlug, {
        hostSlug,
        count: increment,
        lastViewedAt: now,
      });
    }
  }

  public recordEventView(eventSlug: string, increment: number = 1) {
    const existing = this.eventViews.get(eventSlug);
    const now = Date.now();
    if (existing) {
      existing.count += increment;
      existing.lastViewedAt = now;
    } else {
      this.eventViews.set(eventSlug, {
        eventSlug,
        count: increment,
        lastViewedAt: now,
      });
    }
  }

  public getTopHosts(limit: number = 5): { hostSlug: string; views: number }[] {
    return Array.from(this.hostViews.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item) => ({
        hostSlug: item.hostSlug,
        views: item.count,
      }));
  }

  public getTopEvents(limit: number = 5): { eventSlug: string; views: number }[] {
    return Array.from(this.eventViews.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item) => ({
        eventSlug: item.eventSlug,
        views: item.count,
      }));
  }
}

export const internalTrafficTracker = new InternalTrafficTracker();
