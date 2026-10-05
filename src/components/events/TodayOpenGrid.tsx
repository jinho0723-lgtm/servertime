"use client";

import Link from "next/link";
import { useState } from "react";
import { NormalizedEvent } from "@/lib/ingestion/types";
import { TargetCountdown } from "@/components/clock/TargetCountdown";
import { formatKstTime, formatKstTimeWithSec, isWithinKstToday } from "@/lib/utils";

interface TodayOpenGridProps {
  events: NormalizedEvent[];
  currentEpochMs: number;
}

// Brand-themed stylish fallback gradients & patterns when no official image exists
const PLATFORM_THEMES: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  interpark: {
    bg: "from-[#0F1E3D] via-[#162B57] to-[#0A1326]",
    border: "border-blue-500/30",
    badge: "bg-blue-600/30 text-blue-300",
    text: "text-blue-400",
  },
  yes24: {
    bg: "from-[#0F2D3D] via-[#143E54] to-[#091C26]",
    border: "border-cyan-500/30",
    badge: "bg-cyan-600/30 text-cyan-300",
    text: "text-cyan-400",
  },
  ticketlink: {
    bg: "from-[#2A153D] via-[#3E1B59] to-[#1A0C26]",
    border: "border-purple-500/30",
    badge: "bg-purple-600/30 text-purple-300",
    text: "text-purple-400",
  },
  melon: {
    bg: "from-[#0F3824] via-[#164E33] to-[#0A2619]",
    border: "border-emerald-500/30",
    badge: "bg-emerald-600/30 text-emerald-300",
    text: "text-emerald-400",
  },
  naver: {
    bg: "from-[#0F3824] via-[#124A2F] to-[#0A2417]",
    border: "border-green-500/30",
    badge: "bg-green-600/30 text-green-300",
    text: "text-green-400",
  },
};

export function TodayOpenGrid({ events, currentEpochMs }: TodayOpenGridProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Strictly filter for events opening within today (24 hours KST)
  const todayOnlyEvents = events.filter((e) => isWithinKstToday(e.openAt));
  // If today has events, show today's events; otherwise show upcoming events with clear upcoming badge
  const isTodayActive = todayOnlyEvents.length > 0;
  const displayList = (isTodayActive ? todayOnlyEvents : events).slice(0, 4);

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>오늘의 주요 오픈</span>
            <span className="text-blue-500 text-sm font-semibold">›</span>
            {isTodayActive && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                오늘 24시간 이내
              </span>
            )}
          </h2>
        </div>
        <Link
          href="/open/today"
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          전체보기 &gt;
        </Link>
      </div>

      {displayList.length === 0 ? (
        <div className="w-full rounded-2xl border border-dashed border-slate-800 bg-[#0C101A]/60 p-8 text-center">
          <p className="text-sm font-medium text-slate-400">
            현재 확인된 오픈 일정이 없습니다. 새로운 일정을 자동으로 수집 중입니다.
          </p>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            인터파크 · 예스24 · 티켓링크 · 멜론티켓의 최신 오픈 공지를 실시간 확인합니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayList.map((evt) => {
            const openDate = new Date(evt.openAt);
            const openTimeStr = formatKstTime(evt.openAt);
            const openEpochMs = openDate.getTime();
            const hasError = imgErrors[evt.id];
            const hasImage = !hasError && evt.imageUrl && !evt.imageUrl.includes("unsplash.com");
            const theme = PLATFORM_THEMES[evt.platform] || PLATFORM_THEMES.interpark;

            return (
              <Link
                key={evt.id}
                href={`/event/${evt.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl premium-card p-4 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Top Row: Time Badge & Platform */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      suppressHydrationWarning
                      className="rounded-md bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-xs font-bold text-rose-400 font-mono"
                    >
                      {openTimeStr}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {evt.platformName}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {evt.title}
                  </h3>
                </div>

                {/* Poster Image OR Dedicated Branded Fallback Artwork */}
                <div className="relative my-3 aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-800 flex items-center justify-center">
                  {hasImage ? (
                    <img
                      src={evt.imageUrl}
                      alt={evt.title}
                      onError={() => handleImageError(evt.id)}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${theme.bg} p-4 flex flex-col justify-between text-left relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none" />
                      
                      <div className="relative z-10 flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${theme.badge}`}>
                          {evt.platformName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          OFFICIAL
                        </span>
                      </div>

                      <div className="relative z-10 my-auto py-1">
                        <span className="text-sm font-black text-white line-clamp-2 drop-shadow-md">
                          {evt.title}
                        </span>
                      </div>

                      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-300 border-t border-white/10 pt-1.5">
                        <span className="truncate">{evt.venue || "온라인 접수"}</span>
                        <span suppressHydrationWarning className="font-bold text-rose-400 shrink-0 ml-1">{openTimeStr} OPEN</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dev Inspector: Visible only in non-production */}
                {process.env.NODE_ENV !== "production" && (
                  <div className="mt-2 rounded-lg bg-slate-900/90 border border-slate-700/60 p-1.5 text-[9px] font-mono text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-cyan-400 font-bold">DEV SOURCE:</span>
                      <span className="text-slate-300 truncate max-w-[120px]">{evt.sourceType} ({evt.platform})</span>
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
            );
          })}
        </div>
      )}
    </section>
  );
}
