import { NormalizedEvent, EventSourceAdapter } from "../types";

interface OpenGraphPayload {
  url: string;
  title: string;
  description: string;
  image: string;
  openAt: string;
  platform: NormalizedEvent["platform"];
  platformName: string;
  hostDomain: string;
  hostSlug: string;
}

export class OpenGraphMetadataAdapter implements EventSourceAdapter {
  public name = "OpenGraphMetadataAdapter";
  public tier = "C" as const;

  public async fetchEvents(): Promise<OpenGraphPayload[]> {
    // Collects public announced event links that support OpenGraph verification
    return [];
  }

  public async parseAndNormalize(rawList: unknown[]): Promise<NormalizedEvent[]> {
    const list = rawList as OpenGraphPayload[];
    return list.map((item) => ({
      id: `og-${encodeURIComponent(item.url)}`,
      slug: item.title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-"),
      title: item.title,
      category: "other",
      platform: item.platform,
      platformName: item.platformName,
      hostDomain: item.hostDomain,
      hostSlug: item.hostSlug,
      sourceUrl: item.url,
      imageUrl: item.image || "/images/card-fallback.png",
      openAt: item.openAt,
      status: "SCHEDULED",
      confidenceScore: 0.85,
      sourceType: "OG_METADATA",
      waitingCount: 0,
      tags: ["OG수집", item.platformName],
    }));
  }
}
