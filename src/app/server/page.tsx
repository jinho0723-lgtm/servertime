"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { SearchBar } from "@/components/common/SearchBar";
import { AdSlot } from "@/components/common/AdSlot";
import { KOREAN_UNIVERSITIES } from "@/lib/university-data";
import { KOREAN_SPORTS_SERVERS } from "@/lib/sports-data";
import Link from "next/link";
import { Clock, Search, ExternalLink, Globe, Sparkles, Building2, Trophy, Star } from "lucide-react";
import { getGuestStorage } from "@/lib/storage/guest-storage";

// Major ticketing platforms & portals
const MAJOR_PLATFORMS = [
  { name: "NOL 티켓 (놀티켓)", domain: "ticket.interpark.com", slug: "interpark", tag: "NOL", desc: "구 인터파크 티켓 · 콘서트 · 뮤지컬 · 스포츠 공식 예매처" },
  { name: "예스24 티켓", domain: "ticket.yes24.com", slug: "yes24", tag: "YES24", desc: "공연 · 전시 · 페스티벌 공식 예매처" },
  { name: "티켓링크", domain: "ticketlink.co.kr", slug: "ticketlink", tag: "PAYCO", desc: "프로야구 · 축구 · 공연 종합 예매처" },
  { name: "멜론티켓", domain: "ticket.melon.com", slug: "melon", tag: "MELON", desc: "단독 콘서트 · 팬미팅 공식 예매처" },
  { name: "네이버 예약", domain: "booking.naver.com", slug: "naver-booking", tag: "NAVER", desc: "팝업스토어 · 전시 · 식당 · 체험 예약" },
  { name: "캐치테이블", domain: "catchtable.co.kr", slug: "catchtable", tag: "CATCH", desc: "오마카세 · 파인다이닝 예약" },
];

export default function ServerDirectoryPage() {
  const [activeTab, setActiveTab] = useState<"all" | "major" | "sports" | "univ">("all");
  const [filterQuery, setFilterQuery] = useState("");

  const guestStorage = typeof window !== "undefined" ? getGuestStorage() : { favorites: [], history: [] };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Title & Headline */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold">
            <Clock className="h-3.5 w-3.5" />
            <span>0.01초 정밀 서버시간 측정 엔진</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            서버시간 조회 & 사이트 검색
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            어떤 사이트 주소든 입력하여 실시간 서버 응답 헤더 기반의 정확한 서버시간을 측정하세요.
          </p>
        </div>

        {/* Global Search Bar Section */}
        <div className="w-full max-w-2xl mx-auto">
          <SearchBar placeholder="서버시간을 측정할 사이트 주소를 입력하세요 (예: ticket.interpark.com, sugang.snu.ac.kr)" />
        </div>

        {/* Categories Tab Selector */}
        <div className="flex items-center justify-center gap-1.5 border-b border-slate-800 pb-4">
          {[
            { id: "all", label: "전체 서버" },
            { id: "major", label: "🎟️ 주요 예매처" },
            { id: "sports", label: "⚾ 프로 스포츠" },
            { id: "univ", label: "🎓 대학교 수강신청" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "border border-slate-800 bg-[#0E1321] text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. Major Ticketing & Reservation Platforms */}
        {(activeTab === "all" || activeTab === "major") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>주요 예매처 & 티켓팅 플랫폼</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">총 {MAJOR_PLATFORMS.length}개</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MAJOR_PLATFORMS.map((item) => (
                <Link
                  key={item.slug}
                  href={`/server/${item.slug}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#1E2538] bg-[#0C101A] p-4 transition-all hover:border-blue-500/50 hover:bg-[#0E1424] hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-blue-600/20 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300 font-mono">
                        {item.tag}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{item.domain}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-400" />
                      0.01초 정밀 측정
                    </span>
                    <span className="text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      시계 보기 &gt;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 2. Professional Sports Ticket Servers */}
        {(activeTab === "all" || activeTab === "sports") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-400" />
                <span>프로 스포츠 구단 티켓 서버 (야구 · 축구 · 배구 · 농구 · e스포츠)</span>
              </h2>
              <Link href="/open/today" className="text-xs text-emerald-400 hover:underline">
                구단 전체보기 ({KOREAN_SPORTS_SERVERS.length}개) &gt;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {KOREAN_SPORTS_SERVERS.slice(0, 6).map((sp) => (
                <Link
                  key={sp.id}
                  href={`/server/${sp.domain}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#1E2538] bg-[#0C101A] p-4 transition-all hover:border-emerald-500/50 hover:bg-[#0E1720]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
                        {sp.league}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{sp.ticketingPlatform}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {sp.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">🏟️ {sp.homeStadium}</p>
                    <p className="text-[11px] font-mono text-blue-400/90 mt-2 bg-blue-500/10 rounded-lg p-1.5 border border-blue-500/20">
                      ⚡ {sp.openRule}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{sp.domain}</span>
                    <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      서버시간 &gt;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 3. University Course Registration Servers */}
        {(activeTab === "all" || activeTab === "univ") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-400" />
                <span>전국 대학교 수강신청 서버 (서울 · 수도권 · 국립대 · 과기원)</span>
              </h2>
              <Link href="/open/today" className="text-xs text-cyan-400 hover:underline">
                대학교 전체보기 ({KOREAN_UNIVERSITIES.length}개) &gt;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {KOREAN_UNIVERSITIES.slice(0, 6).map((univ) => (
                <Link
                  key={univ.id}
                  href={`/server/${univ.domain}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#1E2538] bg-[#0C101A] p-4 transition-all hover:border-cyan-500/50 hover:bg-[#0E1522]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-400 font-mono">
                        {univ.region}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{univ.openTimeDesc}</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {univ.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">({univ.shortName})</span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">{univ.domain}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">수강신청 서버</span>
                    <span className="text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      시계 보기 &gt;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <AdSlot />
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
