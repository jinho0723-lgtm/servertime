import { NormalizedEvent, EventSourceAdapter } from "../types";

interface Yes24SlideItem {
  id: string;
  title: string;
  openDateText: string;
  imageUrl: string | null;
  url: string;
}

/**
 * Public adapter for YES24 Ticket Open Notices.
 * Fetches real ticket open slides from YES24 official Notice page.
 * URL: http://ticket.yes24.com/New/Notice/NoticeMain.aspx
 */
export class Yes24PublicAdapter implements EventSourceAdapter {
  public name = "Yes24PublicAdapter";
  public tier = "B" as const;

  public async fetchEvents(): Promise<Yes24SlideItem[]> {
    try {
      const res = await fetch("http://ticket.yes24.com/New/Notice/NoticeMain.aspx", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(6000),
        cache: "no-store",
      });

      if (!res.ok) return [];

      const html = await res.text();
      const items: Yes24SlideItem[] = [];

      // Pattern: <a href='(/Notice\?[^']*#id=([0-9]+)[^']*)'>...<p class='ticket-date'>([^<]+)</p><p class='ticket-tit'>([^<]+)</p>
      const slideRegex = /<a\s+href='(\/Notice\?[^']*#id=([0-9]+)[^']*)'>([\s\S]*?)<\/a>/gi;
      let match: RegExpExecArray | null;

      while ((match = slideRegex.exec(html)) !== null) {
        const urlPath = match[1];
        const id = match[2];
        const inner = match[3];

        const dateMatch = inner.match(/class='ticket-date'>([^<]+)<\/p>/);
        const titMatch = inner.match(/class='ticket-tit'>([^<]+)<\/p>/);
        const imgMatch = inner.match(/src='([^']+)'/);

        if (dateMatch && titMatch) {
          const rawImg = imgMatch ? imgMatch[1] : null;
          const fullImg = rawImg ? (rawImg.startsWith("//") ? `https:${rawImg}` : rawImg) : null;

          items.push({
            id,
            title: titMatch[1].trim(),
            openDateText: dateMatch[1].trim(),
            imageUrl: fullImg,
            url: `https://ticket.yes24.com${urlPath}`,
          });
        }
      }

      return items;
    } catch {
      return [];
    }
  }

  public async parseAndNormalize(rawItems: Yes24SlideItem[]): Promise<NormalizedEvent[]> {
    const events: NormalizedEvent[] = [];

    for (const raw of rawItems) {
      try {
        // Date format: "2026.10.06(화) 13:00"
        const cleanDateStr = raw.openDateText.replace(/\([가-힣]+\)/, " ").trim();
        const dateParts = cleanDateStr.split(/\s+/);
        if (dateParts.length < 2) continue;

        const ymd = dateParts[0].replace(/\./g, "-");
        const time = dateParts[1];
        const isoString = `${ymd}T${time}:00+09:00`;
        const openEpoch = new Date(isoString).getTime();
        if (isNaN(openEpoch)) continue;

        events.push({
          id: `yes24-open-${raw.id}`,
          slug: `yes24-open-${raw.id}`,
          title: raw.title,
          category: raw.title.includes("뮤지컬") ? "musical" : raw.title.includes("연극") ? "musical" : "concert",
          platform: "yes24",
          platformName: "예스24 티켓",
          hostDomain: "ticket.yes24.com",
          hostSlug: "yes24",
          openAt: new Date(openEpoch).toISOString(),
          timezone: "Asia/Seoul",
          confidenceScore: 0.95,
          sourceType: "SCRAPER",
          sourceUrl: raw.url,
          imageUrl: raw.imageUrl || "",
          waitingCount: 0,
          status: openEpoch > Date.now() ? "SCHEDULED" : "CLOSED",
          venue: "YES24 티켓 공지 참조",
          tags: ["예스24", "공식오픈"],
          verifiedAt: new Date().toISOString(),
        });
      } catch {
        continue;
      }
    }

    return events;
  }
}
