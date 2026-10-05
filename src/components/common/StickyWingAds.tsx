"use client";

import { useState } from "react";
import { X, ExternalLink } from "lucide-react";

interface StickyWingAdsProps {
  leftSlotId?: string;
  rightSlotId?: string;
}

/**
 * High-Yield, Non-Intrusive PC Sticky Wing Banners (좌/우 스카이스크래퍼 플로팅 배너)
 * - Only visible on wide desktop screens (2xl: min-width 1536px) to avoid crowding content.
 * - Perfectly positioned in the deep side gutters, away from the clock.
 * - Maximizes viewability (90%+) and Google AdSense auto-refresh eCPM during long dwell times.
 * - Features user-dismissable toggle (✕) to respect user control.
 */
export function StickyWingAds({
  leftSlotId = "servertime-wing-left",
  rightSlotId = "servertime-wing-right",
}: StickyWingAdsProps) {
  const [leftDismissed, setLeftDismissed] = useState(false);
  const [rightDismissed, setRightDismissed] = useState(false);

  return (
    <>
      {/* Left Wing Banner */}
      {!leftDismissed && (
        <aside
          aria-label="광고 배너 (좌측)"
          className="hidden 2xl:flex fixed left-4 3xl:left-8 top-32 z-30 flex-col items-center w-[160px] select-none transition-all duration-300"
        >
          <div className="w-full flex items-center justify-between pb-1.5 px-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="tracking-wider">SPONSOR</span>
            <button
              onClick={() => setLeftDismissed(true)}
              className="hover:text-slate-900 dark:hover:text-white p-0.5 rounded transition"
              title="배너 닫기"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="w-[160px] h-[600px] rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0A0E17]/80 backdrop-blur-md p-2.5 flex flex-col justify-between shadow-lg shadow-black/5 dark:shadow-black/20">
            {/* AdSense ins Placeholder Container */}
            <div className="flex-1 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-[#06090F]/70 flex flex-col items-center justify-center p-3 text-center">
              <span className="text-[10px] font-mono tracking-widest text-blue-600 dark:text-blue-400 font-bold uppercase">
                160 x 600
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                WIDE SKYSCRAPER
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                구글 애드센스<br />공식 스카이스크래퍼
              </p>
              <div className="mt-4 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-[10px] text-blue-600 dark:text-blue-300 font-mono">
                HIGH VIEWABILITY
              </div>
            </div>

            <div className="mt-2 text-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <a
                href="mailto:you-n-us@naver.com?subject=[SERVERTIME] 광고 게재 문의"
                className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
              >
                광고 문의
              </a>
            </div>
          </div>
        </aside>
      )}

      {/* Right Wing Banner */}
      {!rightDismissed && (
        <aside
          aria-label="광고 배너 (우측)"
          className="hidden 2xl:flex fixed right-4 3xl:right-8 top-32 z-30 flex-col items-center w-[160px] select-none transition-all duration-300"
        >
          <div className="w-full flex items-center justify-between pb-1.5 px-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="tracking-wider">SPONSOR</span>
            <button
              onClick={() => setRightDismissed(true)}
              className="hover:text-slate-900 dark:hover:text-white p-0.5 rounded transition"
              title="배너 닫기"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="w-[160px] h-[600px] rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0A0E17]/80 backdrop-blur-md p-2.5 flex flex-col justify-between shadow-lg shadow-black/5 dark:shadow-black/20">
            {/* AdSense ins Placeholder Container */}
            <div className="flex-1 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-[#06090F]/70 flex flex-col items-center justify-center p-3 text-center">
              <span className="text-[10px] font-mono tracking-widest text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                160 x 600
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                WIDE SKYSCRAPER
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                구글 애드센스<br />공식 스카이스크래퍼
              </p>
              <div className="mt-4 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-300 font-mono">
                LONG DWELL REFRESH
              </div>
            </div>

            <div className="mt-2 text-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <a
                href="mailto:you-n-us@naver.com?subject=[SERVERTIME] 광고 게재 문의"
                className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
              >
                광고 문의
              </a>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
