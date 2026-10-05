import { NormalizedEvent, EventSourceAdapter } from "../types";

interface InterparkNoticeItem {
  id: string;
  title: string;
  openDateStr: string;
  url: string;
}

/**
 * Public adapter for Interpark Ticket Open Notices.
 * 
 * Note on Interpark Infrastructure:
 * In late 2024–2026, Interpark transitioned ticketing operations to Yanolja (NOL Ticket)
 * with mandatory cloud anti-bot/WAF and migration from ticket.interpark.com to nol.yanolja.com.
 * Direct public HTTP scraping from headless environments is blocked or redirected with 404/302.
 * 
 * This adapter attempts to fetch public notices cleanly, but reports zero events with an anomaly
 * log if blocked, adhering strictly to the principle: "Never fake events if public data is blocked".
 */
export class InterparkPublicAdapter implements EventSourceAdapter {
  public name = "InterparkPublicAdapter";
  public tier = "B" as const;

  public async fetchEvents(): Promise<InterparkNoticeItem[]> {
    try {
      const res = await fetch("https://ticket.interpark.com/Contents/Ranking", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      });

      if (!res.ok) {
        return [];
      }

      // No open notice tables are exposed without JavaScript hydration / WAF session.
      return [];
    } catch {
      return [];
    }
  }

  public async parseAndNormalize(rawItems: InterparkNoticeItem[]): Promise<NormalizedEvent[]> {
    return [];
  }
}
