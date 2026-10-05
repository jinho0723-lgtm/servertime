"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { TargetCountdown } from "@/components/clock/TargetCountdown";
import { AdSlot } from "@/components/common/AdSlot";
import { InFeedAdCard } from "@/components/common/InFeedAdCard";
import { NormalizedEvent } from "@/lib/ingestion/types";
import { formatKstTime, formatKstTimeWithSec, isWithinKstToday, getApiUrl } from "@/lib/utils";
import { KOREAN_UNIVERSITIES, UniversityCourseServer } from "@/lib/university-data";
import { KOREAN_SPORTS_SERVERS, SportsTicketServer } from "@/lib/sports-data";
import Link from "next/link";
import { Calendar, Search, Clock, Trophy } from "lucide-react";

import { FIXTURE_EVENTS } from "@/lib/ingestion/sample-fixtures";

export default function TodayOpenPage() {
  const [currentEpoch, setCurrentEpoch] = useState(Date.now());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [events, setEvents] = useState<NormalizedEvent[]>([]);

  // Time-window filter: "today" (today's 24 hours KST) vs "all" (including upcoming)
  const [timeWindow, setTimeWindow] = useState<"today" | "all">("today");

  // University specific filters
  const [univSearch, setUnivSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  // Sports specific filters
  const [sportsSearch, setSportsSearch] = useState("");
  const [selectedSportsLeague, setSelectedSportsLeague] = useState<string>("all");

  useEffect(() => {
    fetch(getApiUrl("/api/events"))
      .then((r) => r.json())
      .then((data) => {
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { id: "all", label: "전체" },
    { id: "concert", label: "콘서트" },
    { id: "musical", label: "뮤지컬" },
    { id: "sports", label: "스포츠" },
    { id: "university", label: "수강신청" },
    { id: "popup", label: "팝업/예약" },
  ];

  // Filter regular events
  const categoryFiltered = useMemo(() => {
    if (selectedCategory === "all") return events;
    return events.filter((e) => e.category === selectedCategory);
  }, [events, selectedCategory]);

  const filteredEvents = useMemo(() => {
    if (timeWindow === "today") {
      return categoryFiltered.filter((e) => isWithinKstToday(e.openAt));
    }
    return categoryFiltered;
  }, [categoryFiltered, timeWindow]);

  // University list filtering
  const filteredUniversities = useMemo(() => {
    let list = [...KOREAN_UNIVERSITIES];
    if (selectedRegion !== "all") {
      list = list.filter((u) => u.region === selectedRegion);
    }
    if (univSearch.trim()) {
      const q = univSearch.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.shortName.toLowerCase().includes(q) ||
          u.domain.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedRegion, univSearch]);

  // Sports list filtering
  const filteredSports = useMemo(() => {
    let list = [...KOREAN_SPORTS_SERVERS];
    // If user typed a search query, prioritize query across all sports unless explicitly filtered
    if (sportsSearch.trim()) {
      const q = sportsSearch.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.league.toLowerCase().includes(q) ||
          s.homeStadium.toLowerCase().includes(q)
      );
    } else if (selectedSportsLeague !== "all") {
      list = list.filter((s) => s.category === selectedSportsLeague || s.league.includes(selectedSportsLeague));
    }
    return list;
  }, [selectedSportsLeague, sportsSearch]);

  const todayCount = useMemo(
    () => categoryFiltered.filter((e) => isWithinKstToday(e.openAt)).length,
    [categoryFiltered]
  );

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Header section with Category tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-500" />
              <span>오늘의 오픈 일정</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              공식 예매처 및 오픈 채널에서 자동 수집·검증된 오늘의 실시간 티켓팅 및 예약 오픈 일정입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === c.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "border border-slate-800 bg-[#0E1321] text-slate-400 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top AdSense Leaderboard Placement */}
        <AdSlot slotId="today-open-top-leaderboard" format="leaderboard" />

        {/* View Mode 1: University Course Registration (수강신청 전체 대학교 모드) */}
        {selectedCategory === "university" ? (
          <div className="space-y-6">
            {/* University Search & Region Filter Bar */}
            <div className="rounded-2xl border border-slate-800 bg-[#0C101A] p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={univSearch}
                  onChange={(e) => setUnivSearch(e.target.value)}
                  placeholder="대학교 이름 또는 약칭을 검색하세요 (예: 서울대, 연세대, 카이스트)"
                  className="w-full rounded-xl border border-slate-800 bg-[#07090E] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0">
                {(["all", "서울", "수도권", "지방거점", "특성화"] as const).map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedRegion === reg
                        ? "bg-blue-600 text-white"
                        : "border border-slate-800 bg-[#07090E] text-slate-400 hover:text-white"
                    }`}
                  >
                    {reg === "all" ? "전체 지역" : reg}
                  </button>
                ))}
              </div>
            </div>

            {/* University Cards Grid */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span>총 {filteredUniversities.length}개 대학교 수강신청 서버</span>
              <span className="text-blue-400">클릭 시 실시간 0.01초 정밀 서버시간으로 이동</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUniversities.map((univ) => (
                <Link
                  key={univ.id}
                  href={`/server/${univ.domain}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#1E2538] bg-[#0C101A] p-4 sm:p-5 transition-all hover:border-blue-500/50 hover:bg-[#0E1424] hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="rounded-md bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[11px] font-bold text-blue-400 font-mono">
                        {univ.region}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {univ.openTimeDesc}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                        {univ.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">({univ.shortName})</span>
                    </div>

                    <p className="text-xs font-mono text-slate-400 mt-1 truncate">
                      {univ.domain}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-mono">
                      <Clock className="h-3.5 w-3.5 text-blue-400" />
                      서버시간 측정
                    </span>
                    <span className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      측정하기 &gt;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : selectedCategory === "sports" ? (
          /* View Mode 2: Sports Ticket Servers (야구 / 축구 / 배구 / 농구 / e스포츠 구단별 예매처) */
          <div className="space-y-6">
            {/* Sports Search & League Filter Bar */}
            <div className="rounded-2xl border border-slate-800 bg-[#0C101A] p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={sportsSearch}
                  onChange={(e) => setSportsSearch(e.target.value)}
                  placeholder="구단명, 종목 또는 경기장을 검색하세요 (예: LG 트윈스, FC 서울, 흥국생명)"
                  className="w-full rounded-xl border border-slate-800 bg-[#07090E] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0">
                {[
                  { id: "all", label: "전체 종목" },
                  { id: "야구", label: "⚾ KBO 야구" },
                  { id: "축구", label: "⚽ K리그 축구" },
                  { id: "배구", label: "🏐 KOVO 배구" },
                  { id: "농구", label: "🏀 KBL 농구" },
                  { id: "e스포츠", label: "🎮 LCK e스포츠" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSportsLeague(item.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedSportsLeague === item.id
                        ? "bg-blue-600 text-white"
                        : "border border-slate-800 bg-[#07090E] text-slate-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sports Cards Grid */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span>총 {filteredSports.length}개 프로 스포츠 구단 티켓 서버</span>
              <span className="text-emerald-400">공식 예매처 서버시간 실시간 측정</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSports.map((sp) => (
                <Link
                  key={sp.id}
                  href={`/server/${sp.domain}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#1E2538] bg-[#0C101A] p-4 sm:p-5 transition-all hover:border-emerald-500/50 hover:bg-[#0E1720] hover:shadow-xl hover:shadow-emerald-500/10"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-400 font-mono">
                        {sp.league}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {sp.ticketingPlatform}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {sp.name}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 truncate">
                      🏟️ {sp.homeStadium}
                    </p>

                    <p className="text-[11px] font-mono text-blue-400/90 mt-2 bg-blue-500/10 rounded-lg p-1.5 border border-blue-500/20">
                      ⚡ {sp.openRule}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-mono">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      {sp.domain}
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      서버시간 &gt;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* View Mode 3: Standard Ticket Open Events (Today 24h & Upcoming Tabs) */
          <div className="space-y-6">
            {/* Time Window Switcher: Today's 24h vs All Upcoming */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0C101A] p-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTimeWindow("today")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    timeWindow === "today"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  오늘 오픈 (24시간 이내) {todayCount > 0 && `(${todayCount})`}
                </button>
                <button
                  onClick={() => setTimeWindow("all")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    timeWindow === "all"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  전체 / 이번 주 오픈 예정 ({categoryFiltered.length})
                </button>
              </div>

              <span className="text-xs text-slate-400 font-mono hidden sm:inline px-3">
                KST (한국 표준시) 기준
              </span>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-slate-800 bg-[#0C101A]/60 p-12 text-center">
                <p className="text-sm font-medium text-slate-400">
                  {timeWindow === "today"
                    ? "오늘(24시간 이내) 예정된 오픈 일정이 없습니다."
                    : "현재 등록된 오픈 일정이 없습니다."}
                </p>
                <p className="text-xs text-slate-500 mt-2 font-mono">
                  {timeWindow === "today" ? (
                    <button
                      onClick={() => setTimeWindow("all")}
                      className="text-blue-400 hover:underline"
                    >
                      전체 및 이번 주 오픈 예정 일정 보기 &gt;
                    </button>
                  ) : (
                    "인터파크 · 예스24 · 티켓링크 · 멜론티켓의 최신 오픈 공지를 실시간 확인합니다."
                  )}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEvents.map((evt, idx) => {
                  const openDate = new Date(evt.openAt);
                  const openTimeStr = formatKstTime(evt.openAt);
                  const openEpochMs = openDate.getTime();
                  const isToday = isWithinKstToday(evt.openAt);

                  return (
                    <Fragment key={evt.id}>
                      <Link
                        href={`/event/${evt.slug}`}
                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1E2538] bg-[#0C101A] p-5 transition-all hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10"
                      >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            suppressHydrationWarning
                            className={`rounded-lg px-2.5 py-0.5 text-xs font-bold font-mono border ${
                              isToday
                                ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                                : "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                            }`}
                          >
                            {openTimeStr} {isToday ? "(오늘)" : `(${openDate.getMonth() + 1}/${openDate.getDate()})`}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{evt.platformName}</span>
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                          {evt.title}
                        </h3>
                      </div>

                      <div className="relative my-4 aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                        <img
                          src={evt.imageUrl}
                          alt={evt.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 text-xs text-slate-300 truncate">
                          {evt.venue || "온라인 신청"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div className="text-xs text-blue-400 font-semibold">
                          ⚡ 관심 급상승
                        </div>
                        <TargetCountdown
                          targetEpochMs={openEpochMs}
                          currentEpochMs={currentEpoch}
                          size="sm"
                          label=""
                        />
                      </div>

                      {/* Dev Inspector: Visible only in non-production */}
                      {process.env.NODE_ENV !== "production" && (
                        <div className="mt-2 rounded-lg bg-slate-900/90 border border-slate-700/60 p-1.5 text-[9px] font-mono text-slate-400 space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-cyan-400 font-bold">DEV SOURCE:</span>
                            <span className="text-slate-300 truncate max-w-[140px]">{evt.sourceType} ({evt.platform})</span>
                          </div>
                          {evt.sourceUrl && (
                            <div className="truncate text-slate-500 hover:text-slate-300">
                              URL: {evt.sourceUrl}
                            </div>
                          )}
                          {evt.verifiedAt && (
                            <div className="text-slate-500">
                              COLLECTED (KST): {formatKstTimeWithSec(evt.verifiedAt)}
                            </div>
                          )}
                        </div>
                      )}
                    </Link>

                    {/* Natural In-Feed Native Card after 3rd ticket */}
                    {idx === 2 && (
                      <InFeedAdCard variant="grid" slotId="open-today-infeed-ad" />
                    )}
                  </Fragment>
                );
              })}
              </div>
            )}
          </div>
        )}

        {/* Bottom AdSense Placement */}
        <AdSlot slotId="today-open-bottom-responsive" format="auto" />
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
