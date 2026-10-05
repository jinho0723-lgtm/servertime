import { describe, it, expect } from "vitest";
import { AutomatedIngestionEngine } from "../lib/ingestion/engine";
import { EventSourceAdapter, NormalizedEvent } from "../lib/ingestion/types";

describe("Automated Ingestion Engine Deduplication & Fault Isolation", () => {
  it("Deduplicates identical events over 3 consecutive ingestion runs (events count does not inflate)", async () => {
    const engine = new AutomatedIngestionEngine();

    // Mock Adapter returning 3 items
    class MockAdapter implements EventSourceAdapter {
      name = "MockAdapter";
      tier = "A" as const;
      async fetchEvents() {
        return [
          { id: "e1", title: "뮤지컬 테스트 1", openAt: "2026-10-10T11:00:00.000Z" },
          { id: "e2", title: "콘서트 테스트 2", openAt: "2026-10-12T11:00:00.000Z" },
          { id: "e3", title: "연극 테스트 3", openAt: "2026-10-15T11:00:00.000Z" },
        ];
      }
      async parseAndNormalize(raw: any[]): Promise<NormalizedEvent[]> {
        return raw.map((r) => ({
          id: `mock-${r.id}`,
          slug: `mock-${r.id}`,
          title: r.title,
          category: "concert",
          platform: "melon",
          platformName: "멜론티켓",
          hostDomain: "ticket.melon.com",
          hostSlug: "melon",
          sourceUrl: "https://ticket.melon.com",
          imageUrl: "",
          waitingCount: 0,
          tags: ["테스트"],
          openAt: r.openAt,
          status: "SCHEDULED",
          confidenceScore: 0.95,
          sourceType: "PUBLIC_PAGE",
          verifiedAt: new Date().toISOString(),
        }));
      }
    }

    engine.registerAdapter(new MockAdapter());

    // Run 1
    const res1 = await engine.runIngestionPipeline();
    const countAfterRun1 = engine.getEvents().length;
    expect(countAfterRun1).toBeGreaterThanOrEqual(3);

    // Run 2 (Immediately after)
    const res2 = await engine.runIngestionPipeline();
    const countAfterRun2 = engine.getEvents().length;
    expect(countAfterRun2).toBe(countAfterRun1); // No duplicate inflation
    expect(res2.dedupedCount).toBeGreaterThanOrEqual(3);

    // Run 3
    const res3 = await engine.runIngestionPipeline();
    const countAfterRun3 = engine.getEvents().length;
    expect(countAfterRun3).toBe(countAfterRun1);
    expect(res3.dedupedCount).toBeGreaterThanOrEqual(3);
  });

  it("Fault Isolation: Failing adapter (e.g. 500, timeout, malformed) does not break other adapters", async () => {
    const engine = new AutomatedIngestionEngine();

    class CrashingAdapter implements EventSourceAdapter {
      name = "CrashingAdapter";
      tier = "B" as const;
      async fetchEvents(): Promise<any[]> {
        throw new Error("HTTP 429 Too Many Requests (WAF block)");
      }
      async parseAndNormalize() {
        return [];
      }
    }

    class WorkingAdapter implements EventSourceAdapter {
      name = "WorkingAdapter";
      tier = "B" as const;
      async fetchEvents(): Promise<any[]> {
        return [{ id: "safe1", title: "정상 이벤트", openAt: "2026-10-20T11:00:00.000Z" }];
      }
      async parseAndNormalize(raw: any[]): Promise<NormalizedEvent[]> {
        return [
          {
            id: "safe-1",
            slug: "safe-1",
            title: raw[0].title,
            category: "concert",
            platform: "yes24",
            platformName: "예스24",
            hostDomain: "ticket.yes24.com",
            hostSlug: "yes24",
            sourceUrl: "https://ticket.yes24.com",
            imageUrl: "",
            waitingCount: 0,
            tags: ["안전"],
            openAt: raw[0].openAt,
            status: "SCHEDULED",
            confidenceScore: 0.95,
            sourceType: "SCRAPER",
            verifiedAt: new Date().toISOString(),
          },
        ];
      }
    }

    engine.registerAdapter(new CrashingAdapter());
    engine.registerAdapter(new WorkingAdapter());

    const result = await engine.runIngestionPipeline();
    expect(result.success).toBe(true);
    expect(result.anomalies.some((a) => a.source === "CrashingAdapter")).toBe(true);
    // Working adapter event was published successfully
    expect(engine.getEventBySlug("safe-1")).toBeDefined();
  });
});
