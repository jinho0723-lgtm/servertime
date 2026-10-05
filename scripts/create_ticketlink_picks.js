const fs = require('fs');

const ticketlinkList = [
  // 1. Ticketlink 이주의 공연·전시 (사용자 업로드 이미지 기준)
  {
    id: 'ticketlink-pick-seunghwan',
    slug: 'ticketlink-seunghwan-10th',
    title: '2026 정승환 10주년 콘서트 〈발라드 좋아하세요?〉',
    category: 'concert',
    platform: 'ticketlink',
    platform_name: '티켓링크',
    host_slug: 'ticketlink',
    open_at: new Date('2026-10-08T20:00:00+09:00').toISOString(),
    source_url: 'https://www.ticketlink.co.kr/product/51920',
    image_url: 'https://image.toast.com/toast/ticket/product/2026/09/20260925_jungseunghwan.jpg',
    venue: '올림픽공원 올림픽홀'
  },
  {
    id: 'ticketlink-pick-frozen',
    slug: 'ticketlink-frozen-musical',
    title: '뮤지컬 〈겨울왕국〉 한국 초연 (FROZEN The Musical)',
    category: 'musical',
    platform: 'ticketlink',
    platform_name: '티켓링크',
    host_slug: 'ticketlink',
    open_at: new Date('2026-10-15T14:00:00+09:00').toISOString(),
    source_url: 'https://www.ticketlink.co.kr/product/51950',
    image_url: 'https://image.toast.com/toast/ticket/product/2026/09/20260920_frozen.jpg',
    venue: '샤롯데씨어터'
  },
  {
    id: 'ticketlink-pick-huhgak',
    slug: 'ticketlink-huhgak-tour',
    title: '허각 전국투어 콘서트 〈공연각: 사이〉',
    category: 'concert',
    platform: 'ticketlink',
    platform_name: '티켓링크',
    host_slug: 'ticketlink',
    open_at: new Date('2026-10-10T18:00:00+09:00').toISOString(),
    source_url: 'https://www.ticketlink.co.kr/product/51935',
    image_url: 'https://image.toast.com/toast/ticket/product/2026/09/20260922_huhgak.jpg',
    venue: '건국대학교 새천년관 대공연장'
  },
  {
    id: 'ticketlink-pick-toulouse',
    slug: 'ticketlink-toulouse-lautrec',
    title: '툴루즈 로트렉 & 수잔 발라동 전시회',
    category: 'musical',
    platform: 'ticketlink',
    platform_name: '티켓링크',
    host_slug: 'ticketlink',
    open_at: new Date('2026-10-12T10:00:00+09:00').toISOString(),
    source_url: 'https://www.ticketlink.co.kr/product/51980',
    image_url: 'https://image.toast.com/toast/ticket/product/2026/09/20260928_toulouse.jpg',
    venue: '마이아트뮤지엄'
  },
  // 2. Ticketlink 주요 스포츠 (KBO 포스트시즌 / 프로축구 K리그 / 프로농구 KBL)
  {
    id: 'ticketlink-sports-kbo-wc',
    slug: 'ticketlink-2026-kbo-wildcard',
    title: '2026 KBO 포스트시즌 와일드카드 결정전 티켓 예매',
    category: 'sports',
    platform: 'ticketlink',
    platform_name: '티켓링크',
    host_slug: 'ticketlink',
    open_at: new Date('2026-10-06T14:00:00+09:00').toISOString(),
    source_url: 'https://www.ticketlink.co.kr/sports',
    image_url: 'https://image.toast.com/toast/ticket/product/2026/09/kbo_postseason_2026.jpg',
    venue: '잠실야구장 / 각 구단 홈구장'
  },
  {
    id: 'ticketlink-sports-kbo-semi',
    slug: 'ticketlink-2026-kbo-semifinal',
    title: '2026 KBO 포스트시즌 준플레이오프 티켓 예매',
    category: 'sports',
    platform: 'ticketlink',
    platform_name: '티켓링크',
    host_slug: 'ticketlink',
    open_at: new Date('2026-10-08T14:00:00+09:00').toISOString(),
    source_url: 'https://www.ticketlink.co.kr/sports',
    image_url: 'https://image.toast.com/toast/ticket/product/2026/09/kbo_postseason_2026.jpg',
    venue: '잠실/수원/대구 등 각 구단 홈구장'
  },
  {
    id: 'ticketlink-sports-kbl-open',
    slug: 'ticketlink-2026-kbl-opening',
    title: '2026-2027 KBL 프로농구 정규리그 개막전 티켓 오픈',
    category: 'sports',
    platform: 'ticketlink',
    platform_name: '티켓링크',
    host_slug: 'ticketlink',
    open_at: new Date('2026-10-11T11:00:00+09:00').toISOString(),
    source_url: 'https://www.ticketlink.co.kr/sports',
    image_url: 'https://image.toast.com/toast/ticket/product/2026/09/kbl_open_2026.jpg',
    venue: '전국 KBL 홈 경기장'
  },
  {
    id: 'ticketlink-sports-kleague-final',
    slug: 'ticketlink-2026-kleague-final',
    title: '2026 하나은행 K리그1 파이널라운드 티켓 예매',
    category: 'sports',
    platform: 'ticketlink',
    platform_name: '티켓링크',
    host_slug: 'ticketlink',
    open_at: new Date('2026-10-13T14:00:00+09:00').toISOString(),
    source_url: 'https://www.ticketlink.co.kr/sports',
    image_url: 'https://image.toast.com/toast/ticket/product/2026/09/kleague_final_2026.jpg',
    venue: '전국 K리그 축구전용경기장'
  }
];

fs.writeFileSync('scripts/ticketlink_curated_picks.json', JSON.stringify(ticketlinkList, null, 2));
console.log('Ticketlink picks & sports saved:', ticketlinkList.length);
