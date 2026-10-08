import { Metadata } from 'next';
import ServerClientView from './ServerClientView';
import { KOREAN_UNIVERSITIES } from '@/lib/university-data';
import { KOREAN_SPORTS_SERVERS } from '@/lib/sports-data';
import { resolveTargetHostname, CANONICAL_SERVERS } from '@/lib/domain-resolver';
import { SITE_CONFIG } from '@/lib/site-config';

interface ServerPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const coreSlugs = [
    // NOL / Interpark (Canonical & Aliases)
    'nol-ticket', 'nol', 'interpark', 'interpark-ticket', 'interparkticket', 'ticket.interpark.com',
    // YES24
    'yes24', 'ticket.yes24.com', 'yes24-ticket',
    // Ticketlink
    'ticketlink', 'ticketlink.co.kr', 'payco',
    // Melon
    'melon', 'ticket.melon.com', 'melon-ticket',
    // Naver
    'naver', 'naver.com', 'naver-booking', 'booking.naver.com',
    // Lifestyle & Portal
    'catchtable', 'catchtable.co.kr', 'kice', 'kice.re.kr',
    'google', 'google.com', 'apple', 'apple.com', 'github', 'github.com',
    'coupang.com', 'musinsa.com', '29cm.co.kr', 'kream.co.kr',
    'letskorail.com', 'etk.srail.kr', 'toss.im'
  ];

  const univSlugs = KOREAN_UNIVERSITIES.flatMap(u => [u.id, u.domain, u.shortName]);
  const sportsSlugs = KOREAN_SPORTS_SERVERS.flatMap(s => [s.id]);

  const all = Array.from(new Set([...coreSlugs, ...univSlugs, ...sportsSlugs]));
  return all.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: ServerPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = decodeURIComponent(resolvedParams.slug).trim().toLowerCase();
  const resolved = resolveTargetHostname(rawSlug);

  const canonicalUrl = `${SITE_CONFIG.canonicalBase}/server/${encodeURIComponent(resolved.canonicalSlug)}`;
  const defaultRobots = {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  };

  // Dedicated titles and descriptions for top platforms
  if (resolved.canonicalSlug === 'nol-ticket') {
    return {
      title: '인터파크 티켓 서버시간 (NOL 티켓) - 초단위 정밀 시계 | SERVERTIME',
      description: '인터파크 티켓(NOL 티켓, ticket.interpark.com) 00초 정각 티켓팅을 위한 실시간 초단위·밀리초 정밀 서버시간 및 오픈 카운트다운을 무료로 확인하세요.',
      keywords: ['인터파크 티켓 서버시간', '인터파크 서버시간', 'NOL 티켓 서버시간', '놀티켓 서버시간', '인터파크티켓팅', '서버시간', '서버타임'],
      robots: defaultRobots,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: '인터파크 티켓 서버시간 (NOL 티켓) - SERVERTIME',
        description: '인터파크 티켓(NOL 티켓) 티켓팅을 위한 정확한 서버시간 및 오픈 카운트다운.',
        url: canonicalUrl,
        siteName: SITE_CONFIG.name,
        type: 'website',
      },
    };
  }

  if (resolved.canonicalSlug === 'yes24') {
    return {
      title: 'YES24 티켓 서버시간 - 예스24 정밀 서버타임 & 카운트다운 | SERVERTIME',
      description: 'YES24 티켓(ticket.yes24.com) 콘서트, 뮤지컬, 연극 티켓팅을 위한 실시간 초단위 정밀 서버시간과 정각 오픈 카운트다운을 제공합니다.',
      keywords: ['YES24 서버시간', '예스24 서버시간', 'YES24 티켓 서버시간', '예스24 티켓팅', '서버시간', '서버타임'],
      robots: defaultRobots,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: 'YES24 티켓 서버시간 - SERVERTIME',
        description: 'YES24 티켓팅을 위한 정확한 서버시간 및 오픈 카운트다운.',
        url: canonicalUrl,
        siteName: SITE_CONFIG.name,
      },
    };
  }

  if (resolved.canonicalSlug === 'ticketlink') {
    return {
      title: '티켓링크 서버시간 - 페이코 티켓링크 정밀 서버타임 | SERVERTIME',
      description: '티켓링크(ticketlink.co.kr) 프로야구, 스포츠, 뮤지컬 티켓 오픈을 위한 실시간 서버시간과 오픈 카운트다운을 확인하세요.',
      keywords: ['티켓링크 서버시간', '페이코 티켓링크 서버시간', '야구 티켓팅 서버시간', '티켓링크', '서버시간', '서버타임'],
      robots: defaultRobots,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: '티켓링크 서버시간 - SERVERTIME',
        description: '티켓링크 스포츠 및 공연 티켓 오픈 서버시간 확인.',
        url: canonicalUrl,
        siteName: SITE_CONFIG.name,
      },
    };
  }

  if (resolved.canonicalSlug === 'melon') {
    return {
      title: '멜론티켓 서버시간 - 멜론 콘서트 티켓팅 초단위 시계 | SERVERTIME',
      description: '멜론티켓(ticket.melon.com) 콘서트, 팬미팅 선예매 및 일반예매를 위한 실시간 초단위 정밀 서버시간 및 오픈 카운트다운을 제공합니다.',
      keywords: ['멜론티켓 서버시간', '멜론 서버시간', '멜론티켓 티켓팅', '멜론 콘서트 예매', '서버시간', '서버타임'],
      robots: defaultRobots,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: '멜론티켓 서버시간 - SERVERTIME',
        description: '멜론티켓 콘서트 및 팬미팅 티켓팅을 위한 정밀 서버시간.',
        url: canonicalUrl,
        siteName: SITE_CONFIG.name,
      },
    };
  }

  if (resolved.canonicalSlug === 'naver' || resolved.canonicalSlug === 'naver-booking') {
    return {
      title: '네이버 서버시간 - 네이버 예약·쇼핑라이브 초단위 정밀 시계 | SERVERTIME',
      description: '네이버 예약(booking.naver.com) 및 쇼핑 라이브 등 주요 선착순 오픈을 위한 네이버 공식 서버시간을 실시간으로 확인하세요.',
      keywords: ['네이버 서버시간', '네이버 예약 서버시간', '네이버시계', '서버시간', '서버타임'],
      robots: defaultRobots,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: '네이버 서버시간 - SERVERTIME',
        description: '네이버 예약 및 오픈을 위한 공식 서버시간 확인.',
        url: canonicalUrl,
        siteName: SITE_CONFIG.name,
      },
    };
  }

  return {
    title: `${resolved.displayName} 서버시간 - 초단위 정밀 서버타임 | SERVERTIME`,
    description: `${resolved.displayName}(${resolved.hostname})의 실시간 서버 기준 시각을 확인하고 오픈 카운트다운을 준비하세요.`,
    keywords: [`${resolved.displayName} 서버시간`, `${resolved.hostname} 서버시간`, '수강신청 서버시간', '서버시간', '서버타임'],
    robots: defaultRobots,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${resolved.displayName} 서버시간 - SERVERTIME`,
      description: `${resolved.displayName}(${resolved.hostname}) 실시간 서버시간 측정 및 오픈 카운트다운.`,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
    },
  };
}

export default async function Page({ params }: ServerPageProps) {
  return <ServerClientView params={params} />;
}
