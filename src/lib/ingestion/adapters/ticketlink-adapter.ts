import { NormalizedEvent, EventSourceAdapter } from "../types";

interface TicketlinkRawItem {
  noticeId: number;
  title: string;
  ticketOpenDatetime: string | null;
  noticeCategoryName: string;
  viewCount: number;
}

/**
 * Public adapter for Ticketlink Open Notices using official public endpoint.
 * URL: http://www.ticketlink.co.kr/help/getNoticeList?page=1&noticeCategoryCode=TICKET_OPEN
 */
export class TicketlinkPublicAdapter implements EventSourceAdapter {
  public name = "TicketlinkPublicAdapter";
  public tier = "B" as const;

  public async fetchEvents(): Promise<TicketlinkRawItem[]> {
    try {
      const res = await fetch(
        "http://www.ticketlink.co.kr/help/getNoticeList?page=1&noticeCategoryCode=TICKET_OPEN",
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json, text/javascript, */*",
            "X-Requested-With": "XMLHttpRequest",
          },
          signal: AbortSignal.timeout(6000),
          cache: "no-store",
        }
      );

      if (!res.ok) return [];

      const data = await res.json();
      const list = data?.result?.result;
      if (Array.isArray(list)) {
        return list;
      }
      return [];
    } catch {
      return [];
    }
  }

  public async parseAndNormalize(rawItems: TicketlinkRawItem[]): Promise<NormalizedEvent[]> {
    const events: NormalizedEvent[] = [];

    for (const raw of rawItems) {
      try {
        if (!raw.ticketOpenDatetime) continue;
        // Ticketlink format: '2026-10-14T11:00:00' (Korea Local Time)
        const dateStr = raw.ticketOpenDatetime.includes("+") || raw.ticketOpenDatetime.endsWith("Z")
          ? raw.ticketOpenDatetime
          : `${raw.ticketOpenDatetime}+09:00`;
        const openEpoch = new Date(dateStr).getTime();
        if (isNaN(openEpoch)) continue;

        // Clean HTML tags from title (e.g. <b>[단독판매]</b>)
        const cleanTitle = raw.title.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        const lowerTitle = cleanTitle.toLowerCase();

        // Accurate category classification
        let category: NormalizedEvent["category"] = "concert";
        const isSports =
          lowerTitle.includes("야구") ||
          lowerTitle.includes("kbo") ||
          lowerTitle.includes("축구") ||
          lowerTitle.includes("k리그") ||
          lowerTitle.includes("배구") ||
          lowerTitle.includes("kovo") ||
          lowerTitle.includes("농구") ||
          lowerTitle.includes("kbl") ||
          lowerTitle.includes("e스포츠") ||
          lowerTitle.includes("lck") ||
          lowerTitle.includes("골프");

        const isMusical =
          lowerTitle.includes("뮤지컬") ||
          lowerTitle.includes("연극") ||
          lowerTitle.includes("오페라") ||
          lowerTitle.includes("발레") ||
          lowerTitle.includes("체험극") ||
          lowerTitle.includes("극단");

        if (isSports) {
          category = "sports";
        } else if (isMusical) {
          category = "musical";
        } else {
          category = "concert";
        }

        events.push({
          id: `ticketlink-open-${raw.noticeId}`,
          slug: `ticketlink-open-${raw.noticeId}`,
          title: cleanTitle,
          category,
          platform: "ticketlink",
          platformName: "티켓링크",
          hostDomain: "ticketlink.co.kr",
          hostSlug: "ticketlink",
          openAt: new Date(openEpoch).toISOString(),
          timezone: "Asia/Seoul",
          confidenceScore: 0.95,
          sourceType: "SCRAPER",
          sourceUrl: `http://www.ticketlink.co.kr/help/notice/${raw.noticeId}`,
          imageUrl: "",
          waitingCount: 0,
          status: openEpoch > Date.now() ? "SCHEDULED" : "CLOSED",
          venue: "티켓링크 공식 공지 참조",
          tags: ["티켓링크", "단독오픈"],
          verifiedAt: new Date().toISOString(),
        });
      } catch {
        continue;
      }
    }

    return events;
  }
}
