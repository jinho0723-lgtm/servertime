const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ywgmcwvysewfkwdzqtwg.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Z21jd3Z5c2V3Zmt3ZHpxdHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MzcxMjIsImV4cCI6MjEwNjUxMzEyMn0.l0Z7kWjmw3qV23TzaSLqaUZ1MjQ0pClzi6WFtrQUk64";

async function upsert(ev) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify(ev)
  });
  console.log(`[${res.status}] ${ev.title} [${ev.category}]`);
}

const extras = [
  // 수강신청
  {
    id: 'sugang-snu-2026-winter',
    slug: 'snu-winter-sugang-2026',
    title: '서울대학교 2026학년도 겨울계절학기 수강신청',
    category: 'sugang',
    platform: 'custom',
    platform_name: '서울대학교 수강신청',
    host_slug: 'snu',
    open_at: new Date('2026-10-15T09:00:00+09:00').toISOString(),
    timezone: 'Asia/Seoul',
    status: 'SCHEDULED',
    source_type: 'OFFICIAL_PAGE',
    source_url: 'https://sugang.snu.ac.kr',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80',
    venue: '서울대학교 학사정보시스템',
    confidence_score: 0.99
  },
  {
    id: 'sugang-yonsei-2026-winter',
    slug: 'yonsei-winter-sugang-2026',
    title: '연세대학교 2026학년도 겨울계절학기 수강신청',
    category: 'sugang',
    platform: 'custom',
    platform_name: '연세대학교 수강신청',
    host_slug: 'yonsei',
    open_at: new Date('2026-10-16T09:00:00+09:00').toISOString(),
    timezone: 'Asia/Seoul',
    status: 'SCHEDULED',
    source_type: 'OFFICIAL_PAGE',
    source_url: 'https://portal.yonsei.ac.kr',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80',
    venue: '연세대학교 포털시스템',
    confidence_score: 0.99
  },
  {
    id: 'sugang-korea-2026-winter',
    slug: 'korea-winter-sugang-2026',
    title: '고려대학교 2026학년도 겨울계절수업 수강신청',
    category: 'sugang',
    platform: 'custom',
    platform_name: '고려대학교 수강신청',
    host_slug: 'korea',
    open_at: new Date('2026-10-17T10:00:00+09:00').toISOString(),
    timezone: 'Asia/Seoul',
    status: 'SCHEDULED',
    source_type: 'OFFICIAL_PAGE',
    source_url: 'https://sugang.korea.ac.kr',
    image_url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&auto=format&fit=crop&q=80',
    venue: '고려대학교 수강신청 전산망',
    confidence_score: 0.99
  },
  // 팝업 / 예약
  {
    id: 'popup-seongsu-dior-2026',
    slug: 'seongsu-dior-concept-store',
    title: '성수 디올 콘셉트 스토어 시즌 사전예약',
    category: 'popup',
    platform: 'naver',
    platform_name: '네이버 예약',
    host_slug: 'naver-booking',
    open_at: new Date('2026-10-09T11:00:00+09:00').toISOString(),
    timezone: 'Asia/Seoul',
    status: 'SCHEDULED',
    source_type: 'OFFICIAL_PAGE',
    source_url: 'https://booking.naver.com',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
    venue: '서울 성동구 성수이로7길 디올 성수',
    confidence_score: 0.98
  },
  {
    id: 'popup-thehyundai-xmas-2026',
    slug: 'the-hyundai-christmas-village',
    title: '2026 더현대 서울 크리스마스 빌리지 1차 사전예약',
    category: 'popup',
    platform: 'naver',
    platform_name: '네이버 예약',
    host_slug: 'naver-booking',
    open_at: new Date('2026-10-14T14:00:00+09:00').toISOString(),
    timezone: 'Asia/Seoul',
    status: 'SCHEDULED',
    source_type: 'OFFICIAL_PAGE',
    source_url: 'https://booking.naver.com',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&auto=format&fit=crop&q=80',
    venue: '더현대 서울 5층 사운즈 포레스트',
    confidence_score: 0.99
  },
  {
    id: 'popup-pokemon-town-2026',
    slug: 'lotte-pokemon-town-popup',
    title: '2026 롯데월드몰 포켓몬 타운 팝업스토어 사전예약',
    category: 'popup',
    platform: 'naver',
    platform_name: '네이버 예약',
    host_slug: 'naver-booking',
    open_at: new Date('2026-10-18T10:00:00+09:00').toISOString(),
    timezone: 'Asia/Seoul',
    status: 'SCHEDULED',
    source_type: 'OFFICIAL_PAGE',
    source_url: 'https://booking.naver.com',
    image_url: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=600&auto=format&fit=crop&q=80',
    venue: '잠실 롯데월드몰 1층 아트리움',
    confidence_score: 0.98
  }
];

async function run() {
  for (const item of extras) {
    await upsert(item);
  }
}

run().catch(console.error);
