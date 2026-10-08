"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { SearchBar } from "@/components/common/SearchBar";
import { HeroTicketVisual } from "@/components/common/HeroTicketVisual";
import { TodayOpenGrid } from "@/components/events/TodayOpenGrid";
import { TrendingPanels } from "@/components/live/TrendingPanels";
import { AdSlot } from "@/components/common/AdSlot";
import { NormalizedEvent } from "@/lib/ingestion/types";
import { getApiUrl } from "@/lib/utils";
import { SITE_CONFIG, COMMON_AEO_FAQS } from "@/lib/site-config";
import { ShieldCheck, Zap, Globe, Clock, HelpCircle, ChevronRight, BookOpen, CheckCircle2, Timer } from "lucide-react";

export default function HomePage() {
  const [currentEpoch, setCurrentEpoch] = useState(Date.now());
  const [events, setEvents] = useState<NormalizedEvent[]>([]);

  useEffect(() => {
    // Fetch live ingested events from Edge Worker / Supabase
    fetch(getApiUrl("/api/events"))
      .then((r) => r.json())
      .then((data) => {
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 sm:space-y-12">
        {/* Desktop Split Hero Section */}
        <section className="relative w-full pt-2 sm:pt-4">
          <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 Columns (Text, Headline, Search Bar, Quick Pills) */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-100/60 dark:bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
                  <span>실시간 정밀 서버시간 플랫폼</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.18]">
                  정확한 서버시간, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400">
                    결정적인 순간
                  </span>
                  을 놓치지 마세요.
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {SITE_CONFIG.shortDescription}
                </p>
              </div>

              {/* Search Bar Input */}
              <div className="w-full">
                <SearchBar />
              </div>

              {/* Official Brand Definition Banner */}
              <div className="rounded-2xl border border-blue-200/80 dark:border-slate-800 bg-blue-50/70 dark:bg-[#0B0F1C]/80 p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm dark:shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
                  <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>SERVERTIME 안내</span>
                </div>
                <p>{SITE_CONFIG.description}</p>
              </div>
            </div>

            {/* Right 5 Columns (3D Neon Ticket Graphic Visual) */}
            <div className="hidden lg:flex lg:col-span-5 items-center justify-end">
              <HeroTicketVisual />
            </div>
          </div>
        </section>

        {/* 1. 오늘의 주요 오픈 Section */}
        <TodayOpenGrid events={events} currentEpochMs={currentEpoch} />

        {/* 2. Middle AdSense Placement (Between Today Open & Live Panels) */}
        <AdSlot slotId="home-middle-responsive" format="auto" />

        {/* 3. Live 3-Column Panels (인기 서버, 급상승 이벤트, 지금 사람들이 보는 곳) */}
        <section style={{ contentVisibility: "auto", containIntrinsicSize: "0 450px" }}>
          <TrendingPanels />
        </section>

        {/* 4. Supported Platforms & Core Transparency Section */}
        <section
          style={{ contentVisibility: "auto", containIntrinsicSize: "0 350px" }}
          className="rounded-3xl premium-card p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span>주요 지원 플랫폼 & 서버시간 특징</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                티켓팅, 수강신청, 예약 등 목적에 맞는 최적화된 서버시간 측정 기능을 제공합니다.
              </p>
            </div>
            <Link
              href="/guide"
              prefetch={false}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>서버시간 활용 가이드 전체보기</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#090C16] p-5 space-y-2.5 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span>NOL 티켓(구 인터파크) & 대형 예매처</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                NOL 티켓(구 인터파크티켓), YES24, 티켓링크, 멜론티켓 등 국내 대표 예매처의 서버시간과 정각 오픈 카운트다운을 지원합니다.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-mono">
                <Link href="/server/nol-ticket" prefetch={false} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">/server/nol-ticket</Link>
                <span className="text-slate-400 dark:text-slate-600">·</span>
                <Link href="/server/yes24" prefetch={false} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">/server/yes24</Link>
                <span className="text-slate-400 dark:text-slate-600">·</span>
                <Link href="/server/melon" prefetch={false} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">/server/melon</Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#090C16] p-5 space-y-2.5 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span>100% 완전 비회원제 & 제로 가짜 데이터</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                개인정보 수집이나 회원가입 없이 브라우저 로컬 저장소로 즐겨찾기와 설정을 안전하게 보존하며, 실제 검증된 이벤트만 노출합니다.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>안전한 익명 보장</span>
                <span className="text-slate-400 dark:text-slate-600">·</span>
                <span>실시간 라이브 수집</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#090C16] p-5 space-y-2.5 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span>정직한 밀리초 보간 기술</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                과장된 오차 보장 없이, HTTP Date 응답과 RTT 측정값, 단조 시계(performance.now())를 결합하여 정직하고 투명하게 시각을 제공합니다.
              </p>
              <div className="pt-2">
                <Link href="/accuracy" className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold">
                  기술 원리 및 한계점 자세히 보기 &gt;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Comprehensive Ticketing & Server Time SEO Knowledge Section */}
        <section
          style={{ contentVisibility: "auto", containIntrinsicSize: "0 550px" }}
          className="rounded-3xl premium-card p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>SERVERTIME KNOWLEDGE BASE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                서버시간이란? 00초 정각 티켓팅·수강신청 완벽 성공 전략
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                스마트폰 시계나 PC 시계 대신 웹서버 고유 시각을 확인해야 하는 이유와 주요 예매처별 공략 노하우를 확인하세요.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Guide Card 1 */}
            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090C16] p-5 space-y-3 shadow-sm dark:shadow-none">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>서버시간과 컴퓨터 시계의 차이</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                일반 컴퓨터나 스마트폰 시계는 통신사 기지국이나 로컬 타임서버에 맞춰져 있어, 인터파크나 예스24 등 대상 웹사이트의 서버 시계와 <strong>0.5초에서 최대 3초 이상 오차</strong>가 발생합니다. 티켓팅 오픈 버튼은 오직 해당 웹사이트의 서버 시계를 기준으로 활성화되므로 정밀 서버시간 확인이 필수적입니다.
              </p>
            </article>

            {/* Guide Card 2 */}
            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090C16] p-5 space-y-3 shadow-sm dark:shadow-none">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>인터파크(NOL)·YES24 00초 클릭법</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                인터파크 티켓(NOL 티켓)과 YES24는 정각 00초에 예매창이 열립니다. 네트워크 왕복 지연(RTT)이 약 20ms 수준이라면 <strong>정각 59초 850~950ms 사이</strong>에 새로고침 또는 예매 버튼을 클릭하여 서버에 00.00초 정각에 패킷이 도착하도록 맞추는 것이 핵심 성공 공식입니다.
              </p>
            </article>

            {/* Guide Card 3 */}
            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090C16] p-5 space-y-3 shadow-sm dark:shadow-none">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Timer className="h-4 w-4 text-emerald-500" />
                <span>수강신청 & 네이버 예약 전략</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                대학교 수강신청 포털(서울대, 고려대, 연세대 등) 및 네이버 예약, 캐치테이블 등은 서버 트래픽이 일시에 몰립니다. 미리 10분 전 로그인 세션을 갱신하고, SERVERTIME 카운트다운을 화면 한쪽에 띄워 정각 00초 알림음에 맞춰 단일 클릭으로 진입하는 것이 안전합니다.
              </p>
            </article>
          </div>

          {/* Quick checklist */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>티켓팅 00초 성공을 위한 필수 체크리스트</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">1.</span>
                <span>오픈 10분 전 사전 로그인 및 본인인증 완료</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">2.</span>
                <span>브라우저 팝업 차단 해제 및 결제수단 사전등록</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">3.</span>
                <span>Wi-Fi 대신 유선 인터넷 또는 안정된 5G 권장</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">4.</span>
                <span>SERVERTIME 정각 카운트다운 알림 활성화</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 6. AEO / GEO Search Engine FAQ Section */}
        <section
          style={{ contentVisibility: "auto", containIntrinsicSize: "0 500px" }}
          className="rounded-3xl premium-card p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-4">
            <HelpCircle className="h-6 w-6 text-purple-500 dark:text-purple-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                서버시간 자주 묻는 질문 (FAQ)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                서버시간의 개념, 티켓팅 활용법, 컴퓨터 시계와의 차이점에 대한 안내입니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMMON_AEO_FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D18] p-4 transition open:border-blue-500/40 shadow-sm dark:shadow-none"
              >
                <summary className="cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-200 group-open:text-blue-600 dark:group-open:text-blue-400 flex items-center justify-between">
                  <span>{faq.question}</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 6. Bottom AdSense Placement (Above Footer) */}
        <AdSlot slotId="home-bottom-leaderboard" format="leaderboard" />
      </main>

      {/* Structured Data JSON-LD for Home Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://servertime.co.kr/#website",
                "url": "https://servertime.co.kr",
                "name": "SERVERTIME",
                "alternateName": ["서버타임", "SERVER TIME"],
                "description": SITE_CONFIG.shortDescription,
                "inLanguage": "ko-KR",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://servertime.co.kr/server/{search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@type": "Organization",
                "@id": "https://servertime.co.kr/#organization",
                "name": "SERVERTIME",
                "url": "https://servertime.co.kr",
                "logo": "https://servertime.co.kr/icon.svg",
                "email": SITE_CONFIG.contactEmail
              },
              {
                "@type": "SoftwareApplication",
                "name": "SERVERTIME 서버시간",
                "applicationCategory": "UtilityApplication",
                "operatingSystem": "All",
                "description": SITE_CONFIG.description,
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "KRW"
                }
              },
              {
                "@type": "FAQPage",
                "mainEntity": COMMON_AEO_FAQS.map((faq) => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              }
            ]
          })
        }}
      />

      <Footer />
      <MobileDock />
    </div>
  );
}
