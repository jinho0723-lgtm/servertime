/**
 * Smart Domain & Alias Resolver for SERVERTIME
 * Maps Korean search queries, brand names, university names, and platform aliases
 * to canonical server routes (e.g. "인터파크", "놀티켓" -> "/server/nol-ticket").
 */

import { KOREAN_UNIVERSITIES } from "./university-data";
import { KOREAN_SPORTS_SERVERS } from "./sports-data";

export interface ResolvedDomain {
  hostname: string;
  displayName: string;
  tag: string;
  canonicalSlug: string;
  isCanonical: boolean;
  matchedKeyword?: string;
}

// Canonical Server Definitions for Top Platforms
export const CANONICAL_SERVERS: Record<string, { hostname: string; displayName: string; tag: string; canonicalSlug: string }> = {
  "nol-ticket": {
    hostname: "ticket.interpark.com",
    displayName: "NOL 티켓(구 인터파크티켓)",
    tag: "NOL",
    canonicalSlug: "nol-ticket",
  },
  yes24: {
    hostname: "ticket.yes24.com",
    displayName: "YES24 티켓",
    tag: "YES24",
    canonicalSlug: "yes24",
  },
  ticketlink: {
    hostname: "ticketlink.co.kr",
    displayName: "티켓링크",
    tag: "PAYCO",
    canonicalSlug: "ticketlink",
  },
  melon: {
    hostname: "ticket.melon.com",
    displayName: "멜론티켓",
    tag: "MELON",
    canonicalSlug: "melon",
  },
  naver: {
    hostname: "naver.com",
    displayName: "네이버",
    tag: "NAVER",
    canonicalSlug: "naver",
  },
  "naver-booking": {
    hostname: "booking.naver.com",
    displayName: "네이버 예약",
    tag: "NAVER",
    canonicalSlug: "naver-booking",
  },
};

// Aliases for Canonical Servers (All point to canonicalSlug)
export const SERVER_ALIASES: Record<string, string> = {
  // NOL / Interpark aliases -> all map to "nol-ticket"
  nol: "nol-ticket",
  "nol-ticket": "nol-ticket",
  interpark: "nol-ticket",
  "interpark-ticket": "nol-ticket",
  interparkticket: "nol-ticket",
  "ticket.interpark.com": "nol-ticket",

  // YES24 aliases
  "yes24-ticket": "yes24",
  "ticket.yes24.com": "yes24",

  // Ticketlink aliases
  "ticketlink.co.kr": "ticketlink",
  payco: "ticketlink",

  // Melon aliases
  "melon-ticket": "melon",
  "ticket.melon.com": "melon",

  // Naver aliases
  "naver.com": "naver",
  "booking.naver.com": "naver-booking",
};

// Search Suggestion & Query Alias Dictionary
export const SEARCH_ALIAS_DICTIONARY: Record<string, string> = {
  // NOL / Interpark variations
  "놀티켓": "nol-ticket",
  "놀 티켓": "nol-ticket",
  "놀": "nol-ticket",
  "nol": "nol-ticket",
  "nol 티켓": "nol-ticket",
  "nol티켓": "nol-ticket",
  "인터파크": "nol-ticket",
  "인터파크티켓": "nol-ticket",
  "인터파크 티켓": "nol-ticket",
  "interpark": "nol-ticket",
  "interpark ticket": "nol-ticket",
  "인터파크 티켓팅": "nol-ticket",
  "놀티켓팅": "nol-ticket",

  // YES24 variations
  "예스24": "yes24",
  "예스 24": "yes24",
  "yes24": "yes24",
  "예스이십사": "yes24",
  "예스24티켓": "yes24",
  "예스24 티켓": "yes24",

  // Ticketlink variations
  "티켓링크": "ticketlink",
  "티링": "ticketlink",
  "ticketlink": "ticketlink",
  "페이코": "ticketlink",

  // Melon variations
  "멜론": "melon",
  "멜론티켓": "melon",
  "멜론 티켓": "melon",
  "melon": "melon",

  // Naver variations
  "네이버": "naver",
  "naver": "naver",
  "네이버예약": "naver-booking",
  "네이버 예약": "naver-booking",

  // Other popular lifestyle & shopping
  "쿠팡": "coupang.com",
  "coupang": "coupang.com",
  "무신사": "musinsa.com",
  "musinsa": "musinsa.com",
  "29cm": "29cm.co.kr",
  "크림": "kream.co.kr",
  "kream": "kream.co.kr",
  "당근": "daangn.com",
  "당근마켓": "daangn.com",
  "번개장터": "bunjang.co.kr",
  "코레일": "letskorail.com",
  "ktx": "letskorail.com",
  "srt": "etk.srail.kr",
  "토스": "toss.im",
  "카카오": "kakao.com",
  "다음": "daum.net",
  "구글": "google.com",
  "유튜브": "youtube.com",
  "애플": "apple.com",
  "깃허브": "github.com",
  "평가원": "kice.re.kr",
  "수능": "kice.re.kr",
  "큐넷": "q-net.or.kr",
  "토익": "exam.ybmnet.co.kr",
};

/**
 * Resolves any raw search query or route parameter into canonical server target
 */
export function resolveTargetHostname(input: string): ResolvedDomain {
  const trimmed = input.trim().toLowerCase();
  const cleanNoSpace = trimmed.replace(/\s+/g, "");

  // 1. Direct Search Alias Dictionary Check
  const aliasMatch = SEARCH_ALIAS_DICTIONARY[cleanNoSpace] || SEARCH_ALIAS_DICTIONARY[trimmed];
  if (aliasMatch) {
    if (CANONICAL_SERVERS[aliasMatch]) {
      const s = CANONICAL_SERVERS[aliasMatch];
      return {
        hostname: s.hostname,
        displayName: s.displayName,
        tag: s.tag,
        canonicalSlug: s.canonicalSlug,
        isCanonical: true,
        matchedKeyword: cleanNoSpace,
      };
    }
    // If it's a domain string directly (e.g. coupang.com)
    return {
      hostname: aliasMatch,
      displayName: aliasMatch.split(".")[0].toUpperCase(),
      tag: aliasMatch.split(".")[0].toUpperCase().slice(0, 5),
      canonicalSlug: aliasMatch,
      isCanonical: true,
      matchedKeyword: cleanNoSpace,
    };
  }

  // 2. Check Route Alias (e.g. "interpark" -> "nol-ticket")
  const serverAliasTarget = SERVER_ALIASES[cleanNoSpace] || SERVER_ALIASES[trimmed];
  if (serverAliasTarget && CANONICAL_SERVERS[serverAliasTarget]) {
    const s = CANONICAL_SERVERS[serverAliasTarget];
    return {
      hostname: s.hostname,
      displayName: s.displayName,
      tag: s.tag,
      canonicalSlug: s.canonicalSlug,
      isCanonical: cleanNoSpace === s.canonicalSlug,
      matchedKeyword: cleanNoSpace,
    };
  }

  // 3. Direct Canonical Server Check
  if (CANONICAL_SERVERS[cleanNoSpace]) {
    const s = CANONICAL_SERVERS[cleanNoSpace];
    return {
      hostname: s.hostname,
      displayName: s.displayName,
      tag: s.tag,
      canonicalSlug: s.canonicalSlug,
      isCanonical: true,
      matchedKeyword: cleanNoSpace,
    };
  }

  // 4. University Check
  const matchedUniv = KOREAN_UNIVERSITIES.find((u) => {
    const uName = u.name.toLowerCase().replace(/\s+/g, "");
    const uShort = u.shortName.toLowerCase().replace(/\s+/g, "");
    return (
      u.id === cleanNoSpace ||
      u.domain.toLowerCase() === cleanNoSpace ||
      uName === cleanNoSpace ||
      uShort === cleanNoSpace ||
      (cleanNoSpace.length >= 2 && uName.startsWith(cleanNoSpace))
    );
  });

  if (matchedUniv) {
    return {
      hostname: matchedUniv.domain,
      displayName: `${matchedUniv.name} 수강신청`,
      tag: "UNIV",
      canonicalSlug: matchedUniv.id,
      isCanonical: true,
      matchedKeyword: cleanNoSpace,
    };
  }

  // 5. Sports Team Check
  const matchedSports = KOREAN_SPORTS_SERVERS.find((s) => {
    const sName = s.name.toLowerCase().replace(/\s+/g, "");
    return s.id === cleanNoSpace || sName === cleanNoSpace || sName.includes(cleanSportsQueryFallback(cleanNoSpace));
  });

  if (matchedSports) {
    return {
      hostname: matchedSports.domain,
      displayName: `${matchedSports.name} (${matchedSports.league})`,
      tag: matchedSports.category === "야구" ? "KBO" : matchedSports.category === "축구" ? "K리그" : "SPORT",
      canonicalSlug: matchedSports.id,
      isCanonical: true,
      matchedKeyword: cleanNoSpace,
    };
  }

  // 6. Direct Domain Name (contains '.')
  if (trimmed.includes(".")) {
    const cleanedDomain = trimmed.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
    const parts = cleanedDomain.split(".");
    return {
      hostname: cleanedDomain,
      displayName: parts[0].toUpperCase(),
      tag: parts[0].toUpperCase().slice(0, 5),
      canonicalSlug: cleanedDomain,
      isCanonical: true,
    };
  }

  // 7. English single word
  if (/^[a-z0-9-]+$/.test(trimmed)) {
    return {
      hostname: `${trimmed}.com`,
      displayName: trimmed.toUpperCase(),
      tag: trimmed.toUpperCase().slice(0, 5),
      canonicalSlug: `${trimmed}.com`,
      isCanonical: true,
    };
  }

  // 8. Fallback
  return {
    hostname: `${trimmed}.com`,
    displayName: trimmed,
    tag: "WEB",
    canonicalSlug: `${trimmed}.com`,
    isCanonical: true,
  };
}

function cleanSportsQueryFallback(str: string): string {
  return str.replace(/프로야구|프로축구|야구|축구|티켓|예매/g, "");
}
