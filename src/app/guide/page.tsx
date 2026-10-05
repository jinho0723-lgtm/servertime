import { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { SITE_CONFIG } from "@/lib/site-config";
import { BookOpen, Ticket, GraduationCap, Utensils, Zap, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "서버시간 완벽 가이드 | SERVERTIME",
  description: "티켓팅, 수강신청, 예약 성공을 위한 서버시간 활용법, NOL 티켓(구 인터파크) 예매 팁, 정각 00초 클릭 노하우 12가지를 안내합니다.",
  alternates: {
    canonical: `${SITE_CONFIG.canonicalBase}/guide`,
  },
};

const GUIDE_ARTICLES = [
  {
    id: "how-to-read-servertime",
    icon: Zap,
    tag: "기초",
    title: "1. 서버시간 보는 법 & 기본 원리",
    summary: "내 PC 시계가 아닌 대상 웹서버의 시계를 왜 확인해야 하는지, 초 단위와 밀리초 보간을 읽는 방법을 설명합니다.",
    content: "대부분의 티켓팅 및 수강신청 사이트는 사용자의 기기 시계가 아니라 자체 서버의 내부 시계를 기준으로 정각 오픈을 판단합니다. SERVERTIME에서 대상 도메인을 검색하여 서버시간과 RTT(왕복 지연)를 확인한 뒤, 정각 00초에 맞춰 새로고침 또는 접속 버튼을 눌러야 합니다.",
    link: "/server",
  },
  {
    id: "ticketing-00sec-strategy",
    icon: Ticket,
    tag: "티켓팅",
    title: "2. 티켓팅 서버시간 노하우: 정각 00초 클릭 전략",
    summary: "정각 59초에 누를 것인가, 00초에 누를 것인가? 네트워크 지연을 반영한 클릭 타이밍의 모든 것.",
    content: "네트워크 왕복 시간(RTT)이 약 20ms 이하라면 정각 59초 850~950 밀리초 사이에 클릭 동작을 시작하여 00.00초에 서버에 요청이 도달하도록 하는 것이 정석입니다. 반면 회선이 느리거나 모바일 환경인 경우 59초 후반보다 정각 00.00초 정각을 목표로 누르는 것이 안전합니다.",
    link: "/practice?tab=timing",
  },
  {
    id: "nol-ticket-guide",
    icon: Ticket,
    tag: "NOL 티켓",
    title: "3. NOL 티켓(구 인터파크) 서버시간 보는 법 및 예매 팁",
    summary: "인터파크 티켓의 새로운 브랜드 NOL 티켓(ticket.interpark.com)의 서버시간 확인 및 예매 팁.",
    content: "NOL 티켓은 기존 인터파크 티켓의 동일한 서버 인프라를 사용합니다. 팝업 차단을 미리 해제하고, 본인인증을 사전 완료해야 합니다. 오픈 30초 전부터 카운트다운을 주시하고 00초에 예매하기 버튼을 누르는 것이 핵심입니다.",
    link: "/server/nol-ticket",
  },
  {
    id: "interpark-to-nol-transition",
    icon: HelpCircle,
    tag: "안내",
    title: "4. 구 인터파크 티켓 찾는 사용자를 위한 통합 안내",
    summary: "인터파크 티켓 서비스를 찾고 계신가요? NOL 티켓 서비스 전환 및 동일 서버시간 안내.",
    content: "인터파크 티켓은 현재 NOL 티켓으로 서비스 명칭이 변경되었습니다. 기존 인터파크 티켓 주소(ticket.interpark.com)와 완전히 동일한 서버에서 운영되므로 SERVERTIME의 /server/nol-ticket 페이지에서 실시간 시각을 확인하시면 됩니다.",
    link: "/server/nol-ticket",
  },
  {
    id: "yes24-strategy",
    icon: Ticket,
    tag: "예매처",
    title: "5. YES24 티켓팅 서버시간 및 예매 팁",
    summary: "YES24 티켓(ticket.yes24.com)의 대기열 시스템 이해와 서버시간 동기화 비법.",
    content: "YES24는 강력한 가상 대기열을 운영합니다. 정각 이전에 새로고침을 누르면 대기열 번호가 부여되지 않거나 에러가 날 수 있으므로, 정확히 SERVERTIME 기준 00초에 예매 버튼을 클릭하여 진입하는 것이 관건입니다.",
    link: "/server/yes24",
  },
  {
    id: "ticketlink-strategy",
    icon: Ticket,
    tag: "예매처",
    title: "6. 티켓링크(페이코) 스포츠·공연 서버시간 공략법",
    summary: "프로야구, 프로축구, 뮤지컬 오픈 시 티켓링크(ticketlink.co.kr) 서버시간 활용법.",
    content: "티켓링크는 스포츠 구단별 예매와 대형 공연 예매가 활발합니다. 페이코(PAYCO) 간편결제를 미리 등록해두고, 정각 00초 서버시간에 맞춰 날짜/회차 선택 화면으로 진입해야 좌석을 선점할 수 있습니다.",
    link: "/server/ticketlink",
  },
  {
    id: "melon-ticket-strategy",
    icon: Ticket,
    tag: "예매처",
    title: "7. 멜론티켓 팬클럽 선예매 & 일반예매 서버시간 전략",
    summary: "멜론티켓(ticket.melon.com)의 고유 예매 방식과 서버시간을 맞추는 최선의 경로.",
    content: "멜론티켓은 오픈 시 정각에 자동으로 예매 버튼이 활성화되는 타이머를 자체 탑재하고 있으나, 로컬 기기 시계 오차로 버튼이 늦게 뜰 수 있습니다. SERVERTIME을 옆에 띄우고 정각 00초에 새로고침(F5)을 하거나 버튼 활성화를 즉시 확인하세요.",
    link: "/server/melon",
  },
  {
    id: "university-sugang-guide",
    icon: GraduationCap,
    tag: "수강신청",
    title: "8. 대학교 수강신청 서버시간 활용법",
    summary: "서울대, 연세대, 고려대 등 각 대학 포털 서버의 시계에 맞춰 장바구니 과목 신청하기.",
    content: "대학교 학사 포털은 매 학기 수강신청 날 트래픽이 폭주합니다. 학사 시스템은 포털 웹서버의 시각을 기준으로만 신청을 허용하므로, 해당 대학교 주소를 검색하여 09:00:00 또는 10:00:00 정각에 맞추어 신청 버튼을 클릭하세요.",
    link: "/server/sugang.snu.ac.kr",
  },
  {
    id: "naver-booking-guide",
    icon: Utensils,
    tag: "예약",
    title: "9. 네이버 예약 및 네이버 쇼핑 라이브 오픈 시간 공략",
    summary: "캠핑장, 인기 팝업스토어, 네이버 예약(booking.naver.com)의 정각 오픈 노하우.",
    content: "네이버 예약은 자정(00:00)이나 오전 9시, 10시에 예약 슬롯이 오픈됩니다. 네이버 공식 서버시간을 확인하고, 네이버페이 결제 수단을 사전 등록해두면 빠른 예약 확정이 가능합니다.",
    link: "/server/naver-booking",
  },
  {
    id: "catchtable-strategy",
    icon: Utensils,
    tag: "예약",
    title: "10. 캐치테이블 및 식당 예약 서버시간 노하우",
    summary: "파인다이닝, 오마카세, 인기 맛집의 매월 1일/15일 정각 예약 성공법.",
    content: "인기 식당의 오픈은 1~2초 만에 마감됩니다. 캐치테이블(catchtable.co.kr) 서버시간을 보면서 예약 날짜와 인원수를 미리 세팅하고, 정각 카운트다운에 맞춰 즉시 예약 창으로 진입하세요.",
    link: "/server/catchtable",
  },
  {
    id: "reduce-pc-clock-drift",
    icon: Zap,
    tag: "최적화",
    title: "11. 서버시간과 컴퓨터 시계 오차(지연) 줄이는 법",
    summary: "Windows/Mac 기기의 시간 동기화 설정 및 네트워크 지연 최소화 환경 구축하기.",
    content: "Windows 설정에서 '지금 동기화'를 눌러 time.windows.com 또는 time.bora.net과 시계를 일치시키세요. Wi-Fi보다는 유선 랜케이블을 연결하고, 불필요한 백그라운드 다운로드를 일시 중지하여 RTT 변동성을 줄이세요.",
    link: "/accuracy",
  },
  {
    id: "click-seat-training",
    icon: Ticket,
    tag: "트레이닝",
    title: "12. 정각 00초 클릭 훈련 및 좌석 포도알 선택 훈련법",
    summary: "실전 오픈 전 손가락 반응 속도와 이선좌 방지를 위한 좌석 선택 시뮬레이션 활용.",
    content: "SERVERTIME의 '티켓팅 연습 센터'에서 정각 00.00초 반응 클릭 훈련과 마이크로 좌석맵(포도알) 연속 광클 훈련을 진행할 수 있습니다. 실전과 유사한 환경에서 반응 속도를 끌어올려 성공 확률을 극대화하세요.",
    link: "/practice",
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Page Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-300">
            <BookOpen className="h-3.5 w-3.5" />
            <span>PRACTICAL TICKETING & OPEN GUIDE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            서버시간 실전 완벽 가이드 12선
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            티켓팅, 수강신청, 예약 오픈 시 실패하지 않는 정각 00초 타이밍 노하우와 예매처별 서버시간 공략법을 집대성했습니다.
          </p>
        </div>

        {/* 12 Topic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GUIDE_ARTICLES.map((article) => {
            const Icon = article.icon;
            return (
              <div
                key={article.id}
                id={article.id}
                className="rounded-2xl border border-slate-800 bg-[#090C16] p-5 space-y-3 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                      {article.tag}
                    </span>
                    <Icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <h2 className="text-base font-bold text-white">
                    {article.title}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {article.summary}
                  </p>
                  <div className="rounded-xl border border-slate-800/80 bg-[#06080F] p-3 text-xs text-slate-300 leading-relaxed mt-2">
                    {article.content}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <Link
                    href={article.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition"
                  >
                    <span>관련 기능 바로가기</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Practice Center CTA */}
        <section className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">직접 손가락 반응 속도를 테스트해보세요</h3>
            <p className="text-xs text-slate-400">
              정각 00.00초 클릭 훈련과 포도알 좌석 선택 훈련을 통해 실전 티켓팅 성공률을 높일 수 있습니다.
            </p>
          </div>
          <Link
            href="/practice"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shrink-0"
          >
            티켓팅 연습 센터 &gt;
          </Link>
        </section>
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
