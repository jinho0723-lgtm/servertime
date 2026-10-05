"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { TargetCountdown } from "@/components/clock/TargetCountdown";
import { LiveChatRoom } from "@/components/live/LiveChatRoom";
import { AdSlot } from "@/components/common/AdSlot";
import { FIXTURE_EVENTS } from "@/lib/ingestion/sample-fixtures";
import { NormalizedEvent } from "@/lib/ingestion/types";
import { Clock, Bell, Calendar, ExternalLink, ShieldCheck } from "lucide-react";
import { getApiUrl } from "@/lib/utils";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}





export default function EventClientView({ params }: EventPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [evt, setEvt] = useState<NormalizedEvent | null>(() => {
    if (process.env.USE_FIXTURES === "true") {
      return FIXTURE_EVENTS.find((e) => e.slug === slug) || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(!evt);
  const [currentEpoch, setCurrentEpoch] = useState(Date.now());

  useEffect(() => {
    fetch(getApiUrl("/api/events"))
      .then((r) => r.json())
      .then((data) => {
        if (data.events && Array.isArray(data.events)) {
          const found = data.events.find((e: NormalizedEvent) => e.slug === slug);
          if (found) setEvt(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);
  const openEpochMs = evt ? new Date(evt.openAt).getTime() : 0;
  const openDateStr = evt
    ? new Date(evt.openAt).toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const trafficHitRecordedRef = useRef<string | null>(null);
  useEffect(() => {
    if (trafficHitRecordedRef.current === slug) return;
    trafficHitRecordedRef.current = slug;

    fetch(getApiUrl("/api/traffic/hit"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug: slug }),
    }).catch(() => {});
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 font-mono text-sm animate-pulse">이벤트 정보를 조회 중입니다...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!evt) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid">
        <Header />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="rounded-3xl border border-dashed border-slate-800 bg-[#0C101A] p-12">
            <h1 className="text-xl font-bold text-white mb-2">오픈 일정을 확인할 수 없습니다</h1>
            <p className="text-sm text-slate-400 mb-6">해당 이벤트는 준비 중이거나 수집 대기 상태입니다.</p>
            <Link href="/open/today" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500">
              오늘의 오픈 목록 보기
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Event Hero Card */}
        <div className="relative overflow-hidden rounded-3xl premium-card p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Left Content */}
            <div className="space-y-3.5 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-blue-600/20 border border-blue-500/40 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                  {evt.category.toUpperCase()}
                </span>
                <span className="rounded-lg bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {evt.platformName}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {evt.title}
              </h1>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-mono">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span suppressHydrationWarning>{openDateStr} 오픈</span>
              </div>

              {/* Big OPEN Countdown */}
              <div className="pt-2">
                <TargetCountdown
                  targetEpochMs={openEpochMs}
                  currentEpochMs={currentEpoch}
                  size="lg"
                  label="OPEN까지"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-blue-400 font-medium pt-1">
                <span>⚡ 공식 예매 오픈 집중 카운트다운</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  href={`/server/${evt.hostSlug}`}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
                >
                  <Clock className="h-4 w-4" />
                  <span>서버시간 보기</span>
                </Link>

                <button
                  onClick={() => alert("오픈 5분 전 브라우저 알람이 등록되었습니다!")}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-200 hover:border-slate-500 hover:text-white transition-all"
                >
                  <Bell className="h-4 w-4 text-blue-400" />
                  <span>알람 설정</span>
                </button>
              </div>
            </div>

            {/* Right Poster / Branded Card */}
            <div className="relative aspect-[3/4] w-52 sm:w-60 overflow-hidden rounded-2xl border border-slate-800 shadow-2xl shrink-0 bg-[#0F172A] flex items-center justify-center">
              {evt.imageUrl ? (
                <img
                  src={evt.imageUrl}
                  alt={evt.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="eager"
                />
              ) : (
                <div className="h-full w-full p-4 flex flex-col justify-between text-left">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{evt.platformName}</span>
                  <div className="my-auto text-center">
                    <span className="text-base font-black text-white">{evt.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 text-right">OFFICIAL OPEN</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AdSense Leaderboard Placement */}
        <AdSlot slotId="event-detail-middle-leaderboard" format="leaderboard" />

        {/* Event Metadata & Live Waiting Room Chat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl premium-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <span>이벤트 정보</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">공연/행사명</span>
                <span className="font-semibold text-white">{evt.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">예매처</span>
                <span className="font-semibold text-blue-400">{evt.platformName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">오픈 시각</span>
                <span suppressHydrationWarning className="font-semibold font-mono text-rose-400">{openDateStr}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">장소/비고</span>
                <span className="font-semibold">{evt.venue || "온라인 신청"}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">데이터 소스</span>
                <span className="font-mono text-emerald-400 font-bold">공식 예매처 공개 페이지 확인</span>
              </div>
            </div>

            {evt.sourceUrl && (
              <a
                href={evt.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-500"
              >
                <span>공식 예매 페이지 바로가기</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <div>
            <LiveChatRoom roomSlug={slug} title={`${evt?.title || "이벤트"} 실시간 대기실`} />
          </div>
        </div>

        {/* Bottom AdSense Placement */}
        <AdSlot slotId="event-detail-bottom-responsive" format="auto" />

        {evt && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Event",
                name: evt.title,
                startDate: evt.openAt,
                location: {
                  "@type": "Place",
                  name: evt.venue || evt.platformName || "온라인",
                },
                image: evt.imageUrl || "https://servertime.co.kr/icon.svg",
                description: `${evt.title} 티켓 오픈 시간: ${evt.openAt}. 예매처: ${evt.platformName}`,
                offers: {
                  "@type": "Offer",
                  url: evt.sourceUrl || `https://servertime.co.kr/event/${slug}`,
                  price: "0",
                  priceCurrency: "KRW",
                  availability: "https://schema.org/InStock",
                  validFrom: evt.openAt,
                },
              }),
            }}
          />
        )}
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
