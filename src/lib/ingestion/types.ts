export interface NormalizedEvent {
  id: string;
  slug: string;
  title: string;
  category: "concert" | "musical" | "sports" | "university" | "reservation" | "popup" | "limited_drop" | "other";
  platform: "interpark" | "yes24" | "ticketlink" | "melon" | "naver" | "catchtable" | "custom";
  platformName: string;
  hostDomain: string;
  hostSlug: string;
  sourceUrl: string;
  officialUrl?: string;
  imageUrl: string;
  openAt: string; // ISO-8601 string
  venue?: string;
  status: "SCHEDULED" | "LIVE" | "CLOSED" | "ARCHIVED";
  confidenceScore: number; // 0.00 ~ 1.00
  sourceType: "OFFICIAL_API" | "PUBLIC_PAGE" | "OG_METADATA" | "FIXTURE" | "SCRAPER";
  waitingCount: number;
  tags: string[];
  timezone?: string;
  verifiedAt?: string;
}

export interface IngestionResult {
  success: boolean;
  totalFetched: number;
  totalNormalized: number;
  dedupedCount: number;
  publishedCount: number;
  anomalies: {
    source: string;
    reason: string;
    itemTitle?: string;
  }[];
}

export interface EventSourceAdapter {
  name: string;
  tier: "A" | "B" | "C";
  fetchEvents(): Promise<unknown[]>;
  parseAndNormalize(rawList: unknown[]): Promise<NormalizedEvent[]>;
}
