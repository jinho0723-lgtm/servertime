import { describe, it, expect } from "vitest";
import { CloudflareTrafficTracker } from "../lib/traffic/traffic-storage";
import { KopisApiAdapter } from "../lib/ingestion/adapters/kopis-adapter";
import { MelonTicketPublicAdapter } from "../lib/ingestion/adapters/melon-ticket-adapter";

describe("CloudflareTrafficTracker (In-Memory Fallback & Zero-PII Hashing)", () => {
  it("strictly hashes raw user identifiers to 16-char hex strings with zero PII retained", () => {
    const tracker = new CloudflareTrafficTracker();
    const hash1 = tracker.hashAnonId("192.168.1.1");
    const hash2 = tracker.hashAnonId("192.168.1.1");
    const hash3 = tracker.hashAnonId("192.168.1.2");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1.length).toBe(16);
    expect(hash1).not.toContain("192.168");
  });

  it("records host and event views into rankings accurately", async () => {
    const tracker = new CloudflareTrafficTracker();
    await tracker.recordHostView("interpark", 5);
    await tracker.recordEventView("melon-open-100", 10);

    const topHosts = await tracker.getTopHosts(5);
    const topEvents = await tracker.getTopEvents(5);

    expect(topHosts.some((h) => h.hostSlug === "interpark")).toBe(true);
    expect(topEvents.some((e) => e.eventSlug === "melon-open-100")).toBe(true);
  });

  it("aggregates active anonymous sessions within 5-minute sliding window", async () => {
    const tracker = new CloudflareTrafficTracker();
    await tracker.recordSession("anon-user-a");
    await tracker.recordSession("anon-user-b");

    const activeCount = await tracker.getActiveUserCount();
    expect(activeCount).toBeGreaterThanOrEqual(2);
  });
});

describe("KopisApiAdapter", () => {
  it("gracefully returns empty array when KOPIS_API_KEY is not configured", async () => {
    delete process.env.KOPIS_API_KEY;
    const adapter = new KopisApiAdapter();
    const result = await adapter.fetchEvents();
    expect(result).toEqual([]);
  });

  it("normalizes KOPIS raw items to standard NormalizedEvent structure with UTC ISO timestamp", async () => {
    const adapter = new KopisApiAdapter();
    const rawMock = [
      {
        id: "PF258100",
        title: "오페라의 유령 2026",
        startDate: "2026.11.20",
        endDate: "2026.12.31",
        facility: "샤롯데씨어터",
        posterUrl: "https://example.com/poster.jpg",
        genre: "뮤지컬",
      },
    ];

    const normalized = await adapter.parseAndNormalize(rawMock);
    expect(normalized.length).toBe(1);
    expect(normalized[0].title).toBe("오페라의 유령 2026");
    expect(normalized[0].category).toBe("musical");
    expect(normalized[0].openAt).toBe("2026-11-20T05:00:00.000Z"); // 14:00 KST = 05:00 UTC
    expect(normalized[0].sourceType).toBe("OFFICIAL_API");
  });
});

describe("MelonTicketPublicAdapter", () => {
  it("correctly parses and normalizes Melon Coming Soon raw announcements", async () => {
    const adapter = new MelonTicketPublicAdapter();
    const mock = [
      {
        csoonId: "50123",
        title: "2026 잔나비 전국투어 콘서트",
        openDateText: "26.10.15(목) 20:00",
        isSolo: true,
        rawUrl: "https://ticket.melon.com/csoon/detail.htm?csoonId=50123",
      },
    ];

    const normalized = await adapter.parseAndNormalize(mock);
    expect(normalized.length).toBe(1);
    expect(normalized[0].id).toBe("melon-50123");
    expect(normalized[0].title).toBe("2026 잔나비 전국투어 콘서트");
    expect(normalized[0].platform).toBe("melon");
    expect(normalized[0].venue).toBe("멜론티켓 단독판매");
    expect(normalized[0].tags).toContain("단독오픈");
  });
});
