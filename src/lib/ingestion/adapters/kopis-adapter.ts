import { NormalizedEvent, EventSourceAdapter } from "../types";

interface KopisRawItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  facility: string;
  posterUrl: string;
  genre: string;
}

export class KopisApiAdapter implements EventSourceAdapter {
  public name = "KopisApiAdapter";
  public tier = "A" as const;
  public isEnabled(): boolean {
    const apiKey = process.env.KOPIS_API_KEY;
    return Boolean(apiKey && apiKey.trim() !== "");
  }

  /**
   * Fetches official upcoming performing arts schedule from KOPIS Open API
   */
  public async fetchEvents(): Promise<KopisRawItem[]> {
    const apiKey = process.env.KOPIS_API_KEY;
    if (!this.isEnabled()) {
      // Explicitly disabled when API key is not configured in environment
      return [];
    }

    try {
      const now = new Date();
      const stdate = this.formatDate(now);
      const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const eddate = this.formatDate(future);

      const url = `http://www.kopis.or.kr/openApi/restful/pblprfr?service=${encodeURIComponent(
        apiKey || ""
      )}&stdate=${stdate}&eddate=${eddate}&cpage=1&rows=25&prfstate=01`;

      const res = await fetch(url, {
        headers: {
          Accept: "application/xml, text/xml, */*",
          "User-Agent": "SERVERTIME-Ingestion-Bot/1.0",
        },
        signal: AbortSignal.timeout(5000), // 5-second strict timeout
        cache: "no-store",
      });

      if (!res.ok) {
        console.warn(`[KopisApiAdapter] HTTP error: ${res.status}`);
        return [];
      }

      const xml = await res.text();
      return this.parseXmlItems(xml);
    } catch (err) {
      console.warn(`[KopisApiAdapter] Fetch error: ${(err as Error).message}`);
      return [];
    }
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  private parseXmlItems(xml: string): KopisRawItem[] {
    const items: KopisRawItem[] = [];
    const dbRegex = /<db>([\s\S]*?)<\/db>/g;
    let match: RegExpExecArray | null;

    while ((match = dbRegex.exec(xml)) !== null) {
      const content = match[1];
      const idMatch = content.match(/<mt20id>([^<]+)<\/mt20id>/);
      const titleMatch = content.match(/<prfnm>([^<]+)<\/prfnm>/);
      const startMatch = content.match(/<prfpdfrom>([^<]+)<\/prfpdfrom>/);
      const endMatch = content.match(/<prfpdto>([^<]+)<\/prfpdto>/);
      const facMatch = content.match(/<fcltynm>([^<]+)<\/fcltynm>/);
      const posterMatch = content.match(/<poster>([^<]+)<\/poster>/);
      const genreMatch = content.match(/<genrenm>([^<]+)<\/genrenm>/);

      if (idMatch && titleMatch && startMatch) {
        items.push({
          id: idMatch[1].trim(),
          title: titleMatch[1].trim(),
          startDate: startMatch[1].trim(),
          endDate: endMatch ? endMatch[1].trim() : "",
          facility: facMatch ? facMatch[1].trim() : "",
          posterUrl: posterMatch ? posterMatch[1].trim() : "",
          genre: genreMatch ? genreMatch[1].trim() : "공연",
        });
      }
    }

    return items;
  }

  public async parseAndNormalize(rawList: unknown[]): Promise<NormalizedEvent[]> {
    const list = rawList as KopisRawItem[];
    const normalized: NormalizedEvent[] = [];

    for (const item of list) {
      // Convert KOPIS date "YYYY.MM.DD" into scheduled open date
      const parts = item.startDate.split(".");
      if (parts.length < 3) continue;

      // Default opening time is 14:00 KST
      const openIso = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}T14:00:00+09:00`;
      const openDate = new Date(openIso);
      if (isNaN(openDate.getTime())) continue;
      const category = this.mapCategory(item.genre);

      normalized.push({
        id: `kopis-${item.id}`,
        slug: `kopis-${item.id.toLowerCase()}`,
        title: item.title,
        category,
        platform: "interpark", // Default major distribution
        platformName: "KOPIS 공시 예매처",
        hostDomain: "ticket.interpark.com",
        hostSlug: "interpark",
        sourceUrl: `https://www.kopis.or.kr/por/view/pblprfr/pblprfr.do?menuId=MNU_00019&id=${item.id}`,
        imageUrl: item.posterUrl || "",
        openAt: openDate.toISOString(),
        venue: item.facility || "지정 공연장",
        status: "SCHEDULED",
        confidenceScore: 0.98,
        sourceType: "OFFICIAL_API",
        waitingCount: 0,
        tags: [item.genre, "KOPIS공식", item.facility].filter(Boolean),
      });
    }

    return normalized;
  }

  private mapCategory(genre: string): NormalizedEvent["category"] {
    if (genre.includes("뮤지컬")) return "musical";
    if (genre.includes("연극")) return "musical";
    if (genre.includes("대중음악") || genre.includes("콘서트")) return "concert";
    if (genre.includes("스포츠")) return "sports";
    return "concert";
  }
}
