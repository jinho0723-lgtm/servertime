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
import { ShieldCheck, Zap, Globe, Clock, HelpCircle, ChevronRight } from "lucide-react";

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
        <section>
          <TrendingPanels />
        </section>

        {/* 4. Supported Platforms & Core Transparency Section */}
        <section className="rounded-3xl premium-card p-6 sm:p-8 space-y-6">
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

        {/* 5. AEO / GEO Search Engine FAQ Section */}
        <section className="rounded-3xl premium-card p-6 sm:p-8 space-y-6">
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
