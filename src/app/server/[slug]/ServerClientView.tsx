"use client";

import { use, useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { PrecisionClockDisplay } from "@/components/clock/PrecisionClockDisplay";
import { MiniClockView } from "@/components/clock/MiniClockView";
import { AlarmController } from "@/components/clock/AlarmController";
import { TargetCountdown } from "@/components/clock/TargetCountdown";
import { FocusModeModal } from "@/components/clock/FocusModeModal";
import { AdSlot } from "@/components/common/AdSlot";
import { StickyWingAds } from "@/components/common/StickyWingAds";
import { SearchBar } from "@/components/common/SearchBar";
import { Star, Share2, Maximize2, Calendar, Bell } from "lucide-react";
import { toggleFavorite, getGuestStorage, addHistoryEntry } from "@/lib/storage/guest-storage";
import { getApiUrl } from "@/lib/utils";

import { KOREAN_UNIVERSITIES } from "@/lib/university-data";
import { KOREAN_SPORTS_SERVERS } from "@/lib/sports-data";
import { resolveTargetHostname } from "@/lib/domain-resolver";

interface ServerPageProps {
  params: Promise<{ slug: string }>;
}





const SERVER_META_MAP: Record<string, { name: string; domain: string; tag: string }> = {
  interpark: { name: "NOL 티켓 (구 인터파크)", domain: "ticket.interpark.com", tag: "NOL" },
  "ticket.interpark.com": { name: "NOL 티켓 (구 인터파크)", domain: "ticket.interpark.com", tag: "NOL" },
  nol: { name: "NOL 티켓 (놀티켓)", domain: "ticket.interpark.com", tag: "NOL" },
  "nol-ticket": { name: "NOL 티켓 (놀티켓)", domain: "ticket.interpark.com", tag: "NOL" },
  yes24: { name: "예스24 티켓", domain: "ticket.yes24.com", tag: "YES24" },
  "ticket.yes24.com": { name: "예스24 티켓", domain: "ticket.yes24.com", tag: "YES24" },
  ticketlink: { name: "티켓링크", domain: "ticketlink.co.kr", tag: "PAYCO" },
  "ticketlink.co.kr": { name: "티켓링크", domain: "ticketlink.co.kr", tag: "PAYCO" },
  melon: { name: "멜론티켓", domain: "ticket.melon.com", tag: "MELON" },
  "ticket.melon.com": { name: "멜론티켓", domain: "ticket.melon.com", tag: "MELON" },
  "naver-booking": { name: "네이버 예약", domain: "booking.naver.com", tag: "NAVER" },
  "booking.naver.com": { name: "네이버 예약", domain: "booking.naver.com", tag: "NAVER" },
  catchtable: { name: "캐치테이블", domain: "catchtable.co.kr", tag: "CATCH" },
  "catchtable.co.kr": { name: "캐치테이블", domain: "catchtable.co.kr", tag: "CATCH" },
  kice: { name: "한국교육과정평가원", domain: "kice.re.kr", tag: "KICE" },
  "kice.re.kr": { name: "한국교육과정평가원", domain: "kice.re.kr", tag: "KICE" },
  naver: { name: "네이버", domain: "naver.com", tag: "NAVER" },
  "naver.com": { name: "네이버", domain: "naver.com", tag: "NAVER" },
  google: { name: "구글", domain: "google.com", tag: "GOOG" },
  "google.com": { name: "구글", domain: "google.com", tag: "GOOG" },
  apple: { name: "애플", domain: "apple.com", tag: "APPLE" },
  "apple.com": { name: "애플", domain: "apple.com", tag: "APPLE" },
  github: { name: "깃허브", domain: "github.com", tag: "GIT" },
  "github.com": { name: "깃허브", domain: "github.com", tag: "GIT" },
};

export default function ServerClientView({ params }: ServerPageProps) {
  const resolvedParams = use(params);
  const rawSlug = decodeURIComponent(resolvedParams.slug).trim().toLowerCase();
  const slug = rawSlug;

  // Smartly resolve target domain and display metadata using domain-resolver
  const resolvedTarget = resolveTargetHostname(rawSlug);
  let targetDomain = resolvedTarget.hostname;
  let serverName = resolvedTarget.displayName;
  let serverTag = resolvedTarget.tag;

  const meta = useMemo(() => ({
    name: serverName,
    domain: targetDomain,
    tag: serverTag,
  }), [serverName, targetDomain, serverTag]);

  const [isFavorited, setIsFavorited] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(Date.now());
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [targetDateStr, setTargetDateStr] = useState(() => {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  });
  const [targetTimeStr, setTargetTimeStr] = useState("20:00:00");
  const [targetEpochMs, setTargetEpochMs] = useState<number | undefined>(undefined);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMini, setIsMini] = useState(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      return sp.get("mini") === "true" || sp.get("mini") === "1";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const mini = sp.get("mini") === "true" || sp.get("mini") === "1";
      if (mini) {
        setIsMini(true);
        const targetParam = sp.get("target");
        if (targetParam) {
          const parsed = parseInt(targetParam, 10);
          if (!isNaN(parsed) && parsed > 0) {
            setTargetEpochMs(parsed);
          }
        }
      }
    }
  }, []);

  const lastTickRef = useRef(0);
  const handleTick = useCallback((ms: number) => {
    if (ms - lastTickRef.current >= 1000) {
      lastTickRef.current = ms;
      setCurrentEpoch(ms);
    }
  }, []);

  const handleQuickPreset = (type: "next_hour" | "next_30m" | "20:00" | "14:00" | "10:00") => {
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    setTargetDateStr(todayStr);

    let targetTime = "20:00:00";
    if (type === "next_hour") {
      const nextH = (now.getHours() + 1) % 24;
      targetTime = `${String(nextH).padStart(2, "0")}:00:00`;
    } else if (type === "next_30m") {
      const curM = now.getMinutes();
      if (curM < 30) {
        targetTime = `${String(now.getHours()).padStart(2, "0")}:30:00`;
      } else {
        const nextH = (now.getHours() + 1) % 24;
        targetTime = `${String(nextH).padStart(2, "0")}:00:00`;
      }
    } else {
      targetTime = `${type}:00`;
    }

    setTargetTimeStr(targetTime);
    const parsed = Date.parse(`${todayStr}T${targetTime}+09:00`) || Date.parse(`${todayStr}T${targetTime}`);
    if (!isNaN(parsed)) {
      setTargetEpochMs(parsed);
      setIsCountdownActive(true);
    }
  };

  const trafficHitRecordedRef = useRef<string | null>(null);
  useEffect(() => {
    if (trafficHitRecordedRef.current === slug) return;
    trafficHitRecordedRef.current = slug;

    const st = getGuestStorage();
    setIsFavorited(st.favorites.includes(slug));
    addHistoryEntry({ slug, name: meta.name, host: meta.domain });
    fetch(getApiUrl("/api/traffic/hit"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostSlug: slug }),
    }).catch(() => {});
  }, [slug, meta.name, meta.domain]);

  const handleFavoriteClick = () => {
    const next = toggleFavorite(slug);
    setIsFavorited(next);
  };

  const handleShareClick = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartCountdown = () => {
    const parsed = Date.parse(`${targetDateStr}T${targetTimeStr}+09:00`) || Date.parse(`${targetDateStr}T${targetTimeStr}`);
    if (!isNaN(parsed)) {
      setTargetEpochMs(parsed);
      setIsCountdownActive(true);
    }
  };

  if (isMini) {
    return (
      <MiniClockView
        host={meta.domain}
        serverName={meta.name}
        serverTag={meta.tag}
        slug={slug}
        initialTargetEpochMs={targetEpochMs}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0 relative">
      <Header />
      <StickyWingAds leftSlotId="server-left-wing" rightSlotId="server-right-wing" />

      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Quick Site Search Bar */}
        <div className="w-full">
          <SearchBar initialValue="" placeholder="다른 사이트 서버시간 검색 (예: naver.com, sugang.snu.ac.kr)" />
        </div>

        {/* Top Header Card matching design_reference.png (01. 서버시간 페이지) */}
        <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl premium-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-600/30">
              {meta.tag}
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{meta.name} 서버시간</h1>
                <span className="inline-block w-fit rounded bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-500/30 px-2 py-0.5 text-[10px] font-mono text-blue-700 dark:text-blue-300">
                  SERVER TIME
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{meta.domain}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFavoriteClick}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                isFavorited
                  ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-bold"
                  : "border-slate-200 dark:border-[#20293D] bg-slate-100 dark:bg-[#0E1321] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white"
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${isFavorited ? "fill-amber-400 text-amber-500" : ""}`} />
              <span className="hidden sm:inline">{isFavorited ? "즐겨찾기됨" : "즐겨찾기"}</span>
            </button>

            <button
              onClick={handleShareClick}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#20293D] bg-slate-100 dark:bg-[#0E1321] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{copied ? "복사완료!" : "공유"}</span>
            </button>
          </div>
        </div>

        {/* Transition Notice for NOL / Interpark */}
        {(slug.includes("nol") || slug.includes("interpark")) && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/70 dark:bg-blue-950/20 p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
            <div>
              <span className="font-bold text-blue-900 dark:text-blue-200">서비스 안내: </span>
              구 인터파크티켓 서비스는 현재 <strong>NOL 티켓</strong>으로 운영되고 있습니다. 기존 인터파크 티켓 서버시간을 찾는 사용자도 동일한 티켓 예매 서버({meta.domain})를 기준으로 실시간 시각을 확인할 수 있습니다.
            </div>
          </div>
        )}

        {/* Top AdSense Leaderboard Placement */}
        <AdSlot slotId="server-clock-top-leaderboard" format="leaderboard" />

        {/* Real Precision Clock Section */}
        <div className="relative p-5 sm:p-8 rounded-3xl premium-card flex flex-col items-center">
          <PrecisionClockDisplay
            host={meta.domain}
            showDetails={true}
            targetOpenEpochMs={targetEpochMs}
            onTick={handleTick}
          />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full max-w-lg">
            <button
              onClick={() => {
                const el = document.getElementById("alarm-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-50 dark:bg-blue-600/20 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-600/30"
            >
              <Bell className="h-3.5 w-3.5" />
              <span>알람 설정</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById("event-mode-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <span>이벤트 모드</span>
            </button>

            <button
              onClick={() => setIsFocusMode(true)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-600/20 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-600/30"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>집중모드</span>
            </button>

            <button
              onClick={() => {
                const width = 460;
                const height = 230;
                const left = typeof window !== "undefined" && window.screenLeft !== undefined 
                  ? Math.round(window.screenLeft + (window.outerWidth - width) / 2) 
                  : 100;
                const top = typeof window !== "undefined" && window.screenTop !== undefined 
                  ? Math.round(window.screenTop + (window.outerHeight - height) / 2) 
                  : 100;
                const targetQuery = targetEpochMs ? `&target=${targetEpochMs}` : "";
                window.open(
                  `/server/${slug}?mini=true${targetQuery}`,
                  `MiniClock_${slug}`,
                  `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=no`
                );
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <span>미니 시계</span>
            </button>
          </div>
        </div>

        {/* Alarm Controller Section */}
        <div id="alarm-section">
          <AlarmController currentEpochMs={currentEpoch} targetOpenEpochMs={targetEpochMs} />
        </div>

        {/* Event Mode Section */}
        <div id="event-mode-section" className="rounded-2xl premium-card p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-rose-500 dark:text-rose-400" />
              <span>예상 오픈 시간 설정</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">카운트다운 자동 생성</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="date"
              value={targetDateStr}
              onChange={(e) => setTargetDateStr(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#090C14] px-3 py-2 text-xs text-slate-900 dark:text-white dark:[color-scheme:dark] [color-scheme:light] cursor-pointer"
            />
            <input
              type="time"
              step="1"
              value={targetTimeStr}
              onChange={(e) => setTargetTimeStr(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#090C14] px-3 py-2 text-xs text-slate-900 dark:text-white dark:[color-scheme:dark] [color-scheme:light] cursor-pointer"
            />
            <button
              onClick={handleStartCountdown}
              className="w-full sm:w-auto rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500"
            >
              카운트다운 시작
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 font-medium mr-1">빠른 프리셋:</span>
            <button
              type="button"
              onClick={() => handleQuickPreset("next_hour")}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090C16] px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white hover:border-blue-400 transition"
            >
              다음 정각
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("next_30m")}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090C16] px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white hover:border-blue-400 transition"
            >
              다음 30분
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("20:00")}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090C16] px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white hover:border-blue-400 transition"
            >
              오늘 20:00
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("14:00")}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090C16] px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white hover:border-blue-400 transition"
            >
              오늘 14:00
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("10:00")}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090C16] px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white hover:border-blue-400 transition"
            >
              오늘 10:00
            </button>
          </div>

          {targetEpochMs && isCountdownActive && (
            <div className="mt-3 p-3 rounded-xl border border-rose-950/60 bg-rose-950/20 flex flex-col items-center">
              <TargetCountdown
                targetEpochMs={targetEpochMs}
                currentEpochMs={currentEpoch}
                size="md"
              />
            </div>
          )}
        </div>

        {/* AEO & GEO Direct Answer Section */}
        <section className="rounded-2xl premium-card p-5 sm:p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>{meta.name} 서버시간이란?</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong>{meta.name} 서버시간</strong>은 해당 웹사이트의 호스팅 서버({meta.domain})가 내부 클록을 기준으로 인식하고 있는 현재 시각입니다. 티켓팅, 수강신청, 예약 등 정각 오픈 시 사용자의 스마트폰이나 PC 시계가 아니라 대상 서버의 시스템 시계를 기준으로 티켓 예매 창이나 신청 버튼이 활성화됩니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-slate-800 bg-[#0A0E1A] p-3">
              <div className="text-xs text-slate-400">대상 호스트</div>
              <div className="font-mono text-sm font-semibold text-slate-200 mt-0.5">{meta.domain}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0A0E1A] p-3">
              <div className="text-xs text-slate-400">활용 목적</div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">정각 오픈 선착순 예매 및 카운트다운</div>
            </div>
          </div>
        </section>

        {/* Technical Transparency & Accuracy Section */}
        <section className="rounded-2xl premium-card p-5 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>서버시간 측정 및 밀리초 보간 기술 안내</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              HTTP 프로토콜 표준 규격에 따라 웹서버는 응답 헤더(<code className="text-blue-300 font-mono">Date</code>)를 초(Second) 단위 정수로 반환합니다. 따라서 웹 환경에서 외부 서버의 절대적인 내부 밀리초를 직접 수신하는 것은 프로토콜상 불가능합니다.
            </p>
            <div className="rounded-xl border border-slate-800 bg-[#080B14] p-3.5 space-y-2">
              <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>밀리초 표시 원리 (정직한 기술 공개)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                화면의 밀리초는 서버가 직접 제공한 millisecond 값이 아니라, 서버 기준 시각을 바탕으로 브라우저의 고정밀 단조 시계(<code className="text-blue-300 font-mono">performance.now()</code>)를 사용하여 연속적으로 보간한 표시값입니다.
              </p>
            </div>
            <p className="text-xs text-slate-400">
              SERVERTIME은 네트워크 왕복 시간(RTT)을 측정하여 비대칭 지연 오차(Uncertainty)를 화면에 투명하게 표기하며, 물리적 네트워크 상황에 따라 미세한 지연이 존재할 수 있음을 정직하게 안내합니다.
            </p>
          </div>
        </section>

        {/* Quick Links to Other Major Servers */}
        <section className="rounded-2xl premium-card p-4 sm:p-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 tracking-wider">주요 예매처 서버시간 바로가기</div>
          <div className="flex flex-wrap gap-2">
            <Link href="/server/nol-ticket" className="rounded-xl border border-slate-800 bg-[#0E1321] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-blue-500/50 transition">
              NOL 티켓(구 인터파크)
            </Link>
            <Link href="/server/yes24" className="rounded-xl border border-slate-800 bg-[#0E1321] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-blue-500/50 transition">
              YES24 티켓
            </Link>
            <Link href="/server/ticketlink" className="rounded-xl border border-slate-800 bg-[#0E1321] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-blue-500/50 transition">
              티켓링크
            </Link>
            <Link href="/server/melon" className="rounded-xl border border-slate-800 bg-[#0E1321] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-blue-500/50 transition">
              멜론티켓
            </Link>
            <Link href="/server/naver-booking" className="rounded-xl border border-slate-800 bg-[#0E1321] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-blue-500/50 transition">
              네이버 예약
            </Link>
            <Link href="/server/catchtable" className="rounded-xl border border-slate-800 bg-[#0E1321] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-blue-500/50 transition">
              캐치테이블
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="rounded-2xl premium-card p-5 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span>자주 묻는 질문 (FAQ)</span>
          </h2>
          <div className="space-y-3">
            {(slug.includes("nol") || slug.includes("interpark") ? [
              {
                q: "인터파크 티켓은 NOL 티켓으로 바뀌었나요?",
                a: "네, 인터파크의 티켓 예매 서비스는 현재 'NOL 티켓'으로 브랜드가 전환되어 운영되고 있습니다. 인터파크 티켓의 주요 콘서트, 뮤지컬, 전시 예매 서비스는 모두 NOL 티켓 플랫폼에서 동일하게 제공됩니다."
              },
              {
                q: "인터파크 티켓 서버시간은 어디서 확인하나요?",
                a: "SERVERTIME의 NOL 티켓 서버시간 페이지(/server/nol-ticket)에서 확인하실 수 있습니다. 기존 인터파크 티켓 주소(ticket.interpark.com)의 서버 기준 시각과 네트워크 지연을 실시간으로 안내합니다."
              },
              {
                q: "NOL 티켓 서버시간과 인터파크 서버시간은 같은 의미인가요?",
                a: "네, 동일한 의미입니다. 기존 인터파크 티켓 시스템이 NOL 티켓으로 개편된 것이므로 동일한 티켓 예매 서버 인프라(ticket.interpark.com)의 기준 시각을 가리킵니다."
              },
              {
                q: "티켓팅할 때 서버시간을 왜 확인하나요?",
                a: "대부분의 티켓팅 사이트는 정각에 예매 버튼이 활성화되도록 서버 시간에 맞춰 프로그래밍되어 있습니다. 내 컴퓨터의 시계가 서버 시계보다 1~2초라도 느리거나 빠르면 예매 버튼이 제때 열리지 않거나 조기 클릭으로 오류가 발생할 수 있기 때문에 서버시간을 확인합니다."
              }
            ] : [
              {
                q: `${meta.name} 서버시간은 왜 중요한가요?`,
                a: `${meta.name}의 오픈 이벤트 및 선착순 접속 시 시스템은 클라이언트 시계가 아닌 ${meta.domain} 서버의 내부 시계를 기준으로 처리합니다. 정확한 오픈 정각을 맞추기 위해 서버시간을 확인해야 합니다.`
              },
              {
                q: "서버시간과 컴퓨터 시간이 왜 다른가요?",
                a: "개인용 컴퓨터나 스마트폰은 로컬 OS의 타임 서버와 동기화되는 반면, 웹사이트 서버는 자체 인프라와 NTP 서버에 동기화됩니다. 이로 인해 기기 설정, 네트워크 지연, 동기화 주기 차이로 수백 밀리초에서 수 초의 오차가 발생합니다."
              },
              {
                q: "밀리초 서버시간은 어떻게 표시되나요?",
                a: "SERVERTIME은 대상 서버와의 왕복 네트워크 지연(RTT)을 측정한 뒤, 브라우저의 고정밀 단조 시계(performance.now)를 활용하여 정각 사이의 밀리초를 연속적으로 정밀 보간하여 표시합니다."
              },
              {
                q: "수강신청이나 티켓팅 팁이 있나요?",
                a: "오픈 최소 10분 전에 접속하여 서버시간의 흐름과 네트워크 지연(RTT) 안정성을 확인하고, 정각 카운트다운을 참고하여 정확한 타이밍에 새로고침 또는 진입 버튼을 누르시기 바랍니다."
              }
            ]).map((faq, idx) => (
              <details key={idx} className="group rounded-xl border border-slate-800 bg-[#090C14] p-3.5 transition open:border-slate-700">
                <summary className="cursor-pointer text-xs sm:text-sm font-semibold text-slate-200 group-open:text-blue-400">
                  {faq.q}
                </summary>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Structured Data JSON-LD for Server Page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebApplication",
                  "name": `${meta.name} 서버시간`,
                  "url": `https://servertime.co.kr/server/${slug}`,
                  "applicationCategory": "UtilityApplication",
                  "operatingSystem": "All",
                  "description": `${meta.name}(${meta.domain})의 실시간 서버 기준 시각 측정 및 오픈 카운트다운 도구`,
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "KRW"
                  }
                },
                {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "SERVERTIME",
                      "item": "https://servertime.co.kr"
                    },
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": `${meta.name} 서버시간`,
                      "item": `https://servertime.co.kr/server/${slug}`
                    }
                  ]
                }
              ]
            })
          }}
        />

        {/* Reusable Non-Intrusive AdSlot */}
        <AdSlot slotId="server-bottom-responsive" format="auto" />
      </main>

      {/* Focus Mode Fullscreen Modal */}
      <FocusModeModal
        isOpen={isFocusMode}
        onClose={() => setIsFocusMode(false)}
        serverName={meta.name}
        host={meta.domain}
        currentEpochMs={currentEpoch}
        targetOpenEpochMs={targetEpochMs}
      />

      <Footer />
      <MobileDock />
    </div>
  );
}
