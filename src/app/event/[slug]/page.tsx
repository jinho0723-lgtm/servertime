import { Metadata } from 'next';
import EventClientView from './EventClientView';
import { SITE_CONFIG } from '@/lib/site-config';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

// At build time, fetch all SCHEDULED event slugs from Supabase via the edge worker.
export async function generateStaticParams() {
  try {
    const edgeBase = process.env.NEXT_PUBLIC_EDGE_API_URL || '';
    const url = edgeBase
      ? `${edgeBase.replace(/\/+$/, '')}/api/events`
      : 'https://timepin-edge.timepin-kr.workers.dev/api/events';

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const events: { slug: string }[] = data.events ?? [];
    console.log(`[generateStaticParams] Building ${events.length} event pages from API`);
    return events.filter(e => e.slug).map(e => ({ slug: e.slug }));
  } catch (e) {
    console.warn('[generateStaticParams] Failed to fetch events from API, using empty list:', e);
    return [];
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const canonicalUrl = `${SITE_CONFIG.canonicalBase}/event/${encodeURIComponent(slug)}`;

  let title = "티켓 오픈 시간 | SERVERTIME";
  let description = "티켓 오픈 시각, 예매처, 서버시간 및 카운트다운 정보를 확인하세요.";
  let posterUrl = `${SITE_CONFIG.canonicalBase}/icon.svg`;

  try {
    const edgeBase = process.env.NEXT_PUBLIC_EDGE_API_URL || '';
    const url = edgeBase
      ? `${edgeBase.replace(/\/+$/, '')}/api/events`
      : 'https://timepin-edge.timepin-kr.workers.dev/api/events';
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const found = data.events?.find((e: any) => e.slug === slug);
      if (found) {
        title = `${found.title} 티켓 오픈 시간 | SERVERTIME`;
        description = `${found.title}의 티켓 오픈 시각, 예매처(${found.platformName}), 서버시간 및 카운트다운 정보를 확인하세요.`;
        if (found.imageUrl) posterUrl = found.imageUrl;
      }
    }
  } catch {}

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      images: [{ url: posterUrl }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [posterUrl],
    },
  };
}

export default async function Page({ params }: EventPageProps) {
  return <EventClientView params={params} />;
}
