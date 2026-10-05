import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';
import { CANONICAL_SERVERS } from '@/lib/domain-resolver';
import { KOREAN_UNIVERSITIES } from '@/lib/university-data';
import { KOREAN_SPORTS_SERVERS } from '@/lib/sports-data';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.canonicalBase;
  const now = new Date();

  // 1. Core Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/server`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/open/today`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/practice`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/live`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/accuracy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community/success`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/tools/countdown`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/world-clock`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 2. Canonical Server Pages
  const serverRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/server/nol-ticket`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/server/yes24`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/server/ticketlink`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/server/melon`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/server/naver-booking`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/server/naver`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/server/catchtable`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // University & Sports Canonical Slugs
  const univRoutes: MetadataRoute.Sitemap = KOREAN_UNIVERSITIES.map((u) => ({
    url: `${baseUrl}/server/${encodeURIComponent(u.id)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  const sportsRoutes: MetadataRoute.Sitemap = KOREAN_SPORTS_SERVERS.map((s) => ({
    url: `${baseUrl}/server/${encodeURIComponent(s.id)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 3. Real Scheduled Events Slugs from Edge API
  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const edgeBase = process.env.NEXT_PUBLIC_EDGE_API_URL || '';
    const url = edgeBase
      ? `${edgeBase.replace(/\/+$/, '')}/api/events`
      : 'https://timepin-edge.timepin-kr.workers.dev/api/events';
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const events: { slug: string; updatedAt?: string }[] = data.events ?? [];
      eventRoutes = events
        .filter((e) => e.slug)
        .map((e) => ({
          url: `${baseUrl}/event/${encodeURIComponent(e.slug)}`,
          lastModified: e.updatedAt ? new Date(e.updatedAt) : now,
          changeFrequency: 'hourly',
          priority: 0.85,
        }));
    }
  } catch {}

  return [...staticRoutes, ...serverRoutes, ...univRoutes, ...sportsRoutes, ...eventRoutes];
}
