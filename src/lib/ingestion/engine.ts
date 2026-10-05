import { NormalizedEvent, EventSourceAdapter, IngestionResult } from "./types";
import { FIXTURE_EVENTS } from "./sample-fixtures";
import { MelonTicketPublicAdapter } from "./adapters/melon-ticket-adapter";
import { OpenGraphMetadataAdapter } from "./adapters/og-metadata-adapter";
import { KopisApiAdapter } from "./adapters/kopis-adapter";
import { InterparkPublicAdapter } from "./adapters/interpark-adapter";
import { Yes24PublicAdapter } from "./adapters/yes24-adapter";
import { TicketlinkPublicAdapter } from "./adapters/ticketlink-adapter";

export class AutomatedIngestionEngine {
  private adapters: EventSourceAdapter[] = [];
  private ingestedEvents: Map<string, NormalizedEvent> = new Map();
  private isProduction = process.env.NODE_ENV === "production";
  private initialized = false;

  constructor() {
    // Register real automated adapters
    this.registerAdapter(new MelonTicketPublicAdapter());
    this.registerAdapter(new InterparkPublicAdapter());
    this.registerAdapter(new Yes24PublicAdapter());
    this.registerAdapter(new TicketlinkPublicAdapter());
    this.registerAdapter(new KopisApiAdapter());
    this.registerAdapter(new OpenGraphMetadataAdapter());

    // Strict Environment Separation:
    // Only when explicitly enabled via USE_FIXTURES="true", seed fixture events.
    // In standard development and production, fixtures are NEVER seeded.
    if (process.env.USE_FIXTURES === "true") {
      FIXTURE_EVENTS.forEach((evt) => {
        this.ingestedEvents.set(evt.slug, evt);
      });
    }
  }

  public registerAdapter(adapter: EventSourceAdapter) {
    this.adapters.push(adapter);
  }

  public async runIngestionPipeline(): Promise<IngestionResult> {
    let totalFetched = 0;
    let totalNormalized = 0;
    let publishedCount = 0;
    let dedupedCount = 0;
    const anomalies: IngestionResult["anomalies"] = [];

    for (const adapter of this.adapters) {
      try {
        const raw = await adapter.fetchEvents();
        totalFetched += raw.length;

        const normalized = await adapter.parseAndNormalize(raw);
        totalNormalized += normalized.length;

        for (const item of normalized) {
          // Validation: Ensure valid openAt date
          if (!item.openAt || isNaN(Date.parse(item.openAt))) {
            anomalies.push({
              source: adapter.name,
              reason: "MISSING_OR_INVALID_OPEN_TIMESTAMP",
              itemTitle: item.title,
            });
            continue;
          }

          // Validation: Confidence score threshold (0.70+)
          if (item.confidenceScore < 0.70) {
            anomalies.push({
              source: adapter.name,
              reason: `LOW_CONFIDENCE_SCORE (${item.confidenceScore})`,
              itemTitle: item.title,
            });
            continue;
          }

          // Deduplication: check existing by slug or composite key (title + platform + openAt)
          const dedupeKey = `${item.title.trim().toLowerCase()}_${item.platform}_${item.openAt}`;
          let isDuplicate = false;
          for (const existing of this.ingestedEvents.values()) {
            const existingKey = `${existing.title.trim().toLowerCase()}_${existing.platform}_${existing.openAt}`;
            if (existing.slug === item.slug || existingKey === dedupeKey) {
              isDuplicate = true;
              break;
            }
          }

          if (isDuplicate) {
            dedupedCount++;
            continue;
          }

          // Auto-publish
          this.ingestedEvents.set(item.slug, item);
          publishedCount++;
        }
      } catch (err) {
        anomalies.push({
          source: adapter.name,
          reason: `ADAPTER_EXECUTION_EXCEPTION: ${(err as Error).message}`,
        });
      }
    }

    this.initialized = true;

    return {
      success: true,
      totalFetched,
      totalNormalized,
      dedupedCount,
      publishedCount,
      anomalies,
    };
  }

  public getEvents(options?: {
    category?: string;
    platform?: string;
    status?: string;
  }): NormalizedEvent[] {
    let list = Array.from(this.ingestedEvents.values());

    // Strictly reject any FIXTURE sourceType items unless explicitly enabled
    if (process.env.USE_FIXTURES !== "true") {
      list = list.filter((e) => e.sourceType !== "FIXTURE");
    }

    // Auto-update status for expired events
    const now = Date.now();
    list = list.map((evt) => {
      const openTime = Date.parse(evt.openAt);
      if (openTime < now && evt.status === "SCHEDULED") {
        return { ...evt, status: "CLOSED" as const };
      }
      return evt;
    });

    if (options?.category && options.category !== "all") {
      list = list.filter((e) => e.category === options.category);
    }
    if (options?.platform && options.platform !== "all") {
      list = list.filter((e) => e.platform === options.platform);
    }
    if (options?.status) {
      list = list.filter((e) => e.status === options.status);
    }

    // Sort by openAt ascending
    return list.sort((a, b) => Date.parse(a.openAt) - Date.parse(b.openAt));
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getEventBySlug(slug: string): NormalizedEvent | undefined {
    const item = this.ingestedEvents.get(slug);
    if (process.env.USE_FIXTURES !== "true" && item?.sourceType === "FIXTURE") {
      return undefined;
    }
    return item;
  }
}

export const ingestionEngine = new AutomatedIngestionEngine();
