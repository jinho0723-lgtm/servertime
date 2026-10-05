import { NormalizedEvent, EventSourceAdapter } from "../types";

interface MelonRawComingSoon {
  csoonId: string;
  title: string;
  openDateText: string;
  isSolo: boolean;
  rawUrl: string;
}

export class MelonTicketPublicAdapter implements EventSourceAdapter {
  public name = "MelonTicketPublicAdapter";
  public tier = "B" as const;

  /**
   * Fetches real publicly announced ticket openings directly from Melon Ticket Coming Soon
   */
  public async fetchEvents(): Promise<MelonRawComingSoon[]> {
    try {
      const res = await fetch("https://ticket.melon.com/main/index.htm", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(6000), // 6-second strict timeout for serverless execution
        cache: "no-store",
      });

      if (!res.ok) {
        console.warn(`[MelonTicketPublicAdapter] HTTP ${res.status} from Melon Ticket`);
        return [];
      }

      const html = await res.text();
      const items: MelonRawComingSoon[] = [];

      // Pattern: <a href="(/csoon/detail.htm?csoonId=[0-9]+)" ...> ... <span class="txt">Title</span> ... <span class="more">[오픈]YY.MM.DD(요일) HH:MM</span>
      const blockRegex = /href="(\/csoon\/detail\.htm\?csoonId=([0-9]+))"[^>]*>([\s\S]*?)<\/a>/g;
      let match: RegExpExecArray | null;

      while ((match = blockRegex.exec(html)) !== null) {
        const linkPath = match[1];
        const csoonId = match[2];
        const innerHtml = match[3];

        const titleMatch = innerHtml.match(/<span class="txt">([^<]+)<\/span>/);
        const openMatch = innerHtml.match(/<span class="more">\[오픈\]([^<]+)<\/span>/);
        const isSolo = innerHtml.includes("단독판매");

        if (titleMatch && openMatch) {
          items.push({
            csoonId,
            title: titleMatch[1].trim(),
            openDateText: openMatch[1].trim(),
            isSolo,
            rawUrl: `https://ticket.melon.com${linkPath}`,
          });
        }
      }

      return items;
    } catch (err) {
      console.warn(`[MelonTicketPublicAdapter] Failed to fetch events: ${(err as Error).message}`);
      return [];
    }
  }

  /**
   * Normalizes Melon Coming Soon items into standard TIMEPIN NormalizedEvent schema
   */
  public async parseAndNormalize(rawList: unknown[]): Promise<NormalizedEvent[]> {
    const list = rawList as MelonRawComingSoon[];
    const normalized: NormalizedEvent[] = [];

    for (const item of list) {
      // Parse Korean date text: e.g. "26.10.05(월) 14:00" -> ISO 8601
      const dateParsed = this.parseKoreanOpenDate(item.openDateText);
      if (!dateParsed) continue;

      const slug = `melon-open-${item.csoonId}`;

      normalized.push({
        id: `melon-${item.csoonId}`,
        slug,
        title: item.title,
        category: "concert",
        platform: "melon",
        platformName: "멜론티켓",
        hostDomain: "ticket.melon.com",
        hostSlug: "melon",
        sourceUrl: item.rawUrl,
        officialUrl: item.rawUrl,
        // Fallback card or Melon Ticket logo if no specific poster
        imageUrl: "https://cdnticket.melon.co.kr/resource/image/web/common/logo.png",
        openAt: dateParsed.toISOString(),
        venue: item.isSolo ? "멜론티켓 단독판매" : "지정 예매처",
        status: "SCHEDULED",
        confidenceScore: 0.95,
        sourceType: "PUBLIC_PAGE",
        waitingCount: 0, // Real user views will accumulate
        tags: item.isSolo ? ["멜론티켓", "단독오픈", "선예매"] : ["멜론티켓", "티켓오픈"],
      });
    }

    return normalized;
  }

  private parseKoreanOpenDate(text: string): Date | null {
    // Format: "26.10.05(월) 14:00"
    const m = text.match(/([0-9]{2})\.([0-9]{2})\.([0-9]{2})\([^)]+\)\s*([0-9]{2}):([0-9]{2})/);
    if (!m) return null;

    const year = 2000 + parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const day = parseInt(m[3], 10);
    const hour = parseInt(m[4], 10);
    const minute = parseInt(m[5], 10);

    return new Date(Date.UTC(year, month, day, hour - 9, minute)); // KST is UTC+9
  }
}
