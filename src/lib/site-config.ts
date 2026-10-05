/**
 * SERVERTIME Official Site Configuration & Constants
 * Defines core brand identity, canonical URLs, AEO FAQs, and SEO definitions.
 */

export const SITE_CONFIG = {
  name: "SERVERTIME",
  domain: "servertime.co.kr",
  canonicalBase: "https://servertime.co.kr",
  runtimeAppUrl: process.env.NEXT_PUBLIC_APP_URL || "https://timepin-frontend.pages.dev",
  edgeApiUrl: process.env.NEXT_PUBLIC_EDGE_API_URL || "https://timepin-edge.timepin-kr.workers.dev",
  
  // Official Brand Definition (No exaggerated claims: no "100% accurate", no "atomic-level")
  description:
    "SERVERTIME은 티켓팅, 수강신청, 예약, 한정 판매 등 정확한 오픈 시각이 중요한 상황에서 웹사이트별 서버 기준 시간을 확인할 수 있도록 돕는 무료 서버시간 서비스입니다.",
  shortDescription:
    "NOL 티켓(구 인터파크티켓), YES24, 티켓링크, 멜론티켓, 네이버 등 주요 사이트의 서버시간을 확인하세요. 티켓팅, 수강신청, 예약 오픈을 위한 무료 서버시간 서비스 SERVERTIME.",
  
  tagline: "정확한 서버시간, 결정적인 순간을 놓치지 마세요.",
  contactEmail: "you-n-us@naver.com",
};

/**
 * Common AEO FAQs for Search Engine Question-Answering
 */
export const COMMON_AEO_FAQS = [
  {
    question: "서버시간이란 무엇인가요?",
    answer:
      "서버시간은 웹사이트를 호스팅하는 서버가 내부 시스템 클록을 기준으로 인식하고 있는 현재 시각을 의미합니다. 티켓팅이나 수강신청 등 선착순 오픈 시 시스템은 사용자의 스마트폰이나 PC 시계가 아니라 대상 웹서버의 시계를 기준으로 신청 접수를 시작합니다.",
  },
  {
    question: "티켓팅할 때 서버시간을 왜 확인하나요?",
    answer:
      "대부분의 티켓팅 사이트는 정각에 예매 버튼이 활성화되도록 서버 시간에 맞춰 프로그래밍되어 있습니다. 내 컴퓨터의 시계가 서버 시계보다 1~2초라도 느리거나 빠르면 예매 버튼이 제때 열리지 않거나 조기 클릭으로 오류가 발생할 수 있기 때문에 서버시간을 확인합니다.",
  },
  {
    question: "서버시간과 컴퓨터 시간이 왜 다른가요?",
    answer:
      "각 개인용 컴퓨터나 스마트폰은 로컬 운영체제의 타임 서버와 동기화되는 반면, 웹사이트 서버는 자체 인프라와 NTP(네트워크 시간 프로토콜) 서버에 동기화됩니다. 이로 인해 기기 설정, 네트워크 지연, 동기화 주기 차이로 수백 밀리초에서 수 초의 오차가 발생합니다.",
  },
  {
    question: "밀리초 서버시간은 어떻게 표시되나요?",
    answer:
      "표준 웹서버는 보안 및 프로토콜 규격상 HTTP Date 헤더를 초(Second) 단위 정수로 제공합니다. SERVERTIME은 대상 서버와의 왕복 네트워크 지연(RTT)을 측정한 뒤, 브라우저의 고정밀 단조 시계(performance.now)를 활용하여 정각 사이의 밀리초를 연속적으로 정밀 보간하여 표시합니다.",
  },
  {
    question: "티켓팅 서버시간은 언제 확인해야 하나요?",
    answer:
      "티켓팅 오픈 최소 10~15분 전에 접속하여 대상 서버의 시간 흐름과 네트워크 지연(RTT) 안정성을 확인하는 것이 좋습니다. 오픈 1분 전부터는 정각 카운트다운을 주시하며 정각 00초에 맞춰 새로고침 또는 예매 버튼을 클릭할 준비를 합니다.",
  },
  {
    question: "수강신청에도 서버시간을 사용할 수 있나요?",
    answer:
      "네, 가능합니다. 대학교 수강신청 시스템 역시 각 대학 포털 서버의 시계를 기준으로 접속과 수강 신청을 처리하므로, 해당 대학교 도메인을 검색하여 서버시간을 확인하면 수강신청 오픈 타이밍을 정확히 맞출 수 있습니다.",
  },
  {
    question: "예약 오픈 시간에도 사용할 수 있나요?",
    answer:
      "네, 네이버 예약, 캐치테이블, KTX 코레일 등 정각에 오픈되는 모든 예약 플랫폼에서 서버시간을 활용할 수 있습니다. 각 서비스 서버의 정각 오픈 기준 시각을 확인하여 예약 성공률을 높일 수 있습니다.",
  },
];

/**
 * NOL Ticket / Interpark Specific FAQs
 */
export const NOL_INTERPARK_FAQS = [
  {
    question: "인터파크 티켓은 NOL 티켓으로 바뀌었나요?",
    answer:
      "네, 인터파크의 티켓 예매 서비스는 현재 'NOL 티켓'으로 브랜드가 전환되어 운영되고 있습니다. 인터파크 티켓의 주요 콘서트, 뮤지컬, 전시 예매 서비스는 모두 NOL 티켓 플랫폼에서 동일하게 제공됩니다.",
  },
  {
    question: "인터파크 티켓 서버시간은 어디서 확인하나요?",
    answer:
      "SERVERTIME의 NOL 티켓 서버시간 페이지(/server/nol-ticket)에서 확인하실 수 있습니다. 기존 인터파크 티켓 주소(ticket.interpark.com)의 서버 기준 시각과 네트워크 지연을 실시간으로 안내합니다.",
  },
  {
    question: "NOL 티켓 서버시간과 인터파크 서버시간은 같은 의미인가요?",
    answer:
      "네, 동일한 의미입니다. 기존 인터파크 티켓 시스템이 NOL 티켓으로 개편된 것이므로 동일한 티켓 예매 서버 인프라(ticket.interpark.com)의 기준 시각을 가리킵니다.",
  },
  {
    question: "NOL 티켓 티켓팅에는 어떤 서버시간을 봐야 하나요?",
    answer:
      "NOL 티켓(ticket.interpark.com)의 공식 서버시간을 확인해야 합니다. SERVERTIME의 /server/nol-ticket 페이지에서 제공하는 실시간 서버시간과 오픈 카운트다운을 바탕으로 티켓팅을 준비하시면 됩니다.",
  },
];
