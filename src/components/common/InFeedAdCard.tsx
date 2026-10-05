"use client";

import { Sparkles, ExternalLink } from "lucide-react";

interface InFeedAdCardProps {
  variant?: "grid" | "list";
  slotId?: string;
}

/**
 * Natural In-Feed Native Ad Card
 * - Blends into ticket grids or community post lists without feeling like clutter.
 * - Strictly labelled "스폰서" / "AD" to adhere to Google AdSense guidelines.
 * - Yields 2x-3x higher CTR than standard flashing display banners.
 */
export function InFeedAdCard({
  variant = "grid",
  slotId = "servertime-infeed-ad",
}: InFeedAdCardProps) {
  if (variant === "list") {
    // Community post list style in-feed card
    return (
      <div className="group rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/70 dark:bg-[#0A0E17]/60 p-4 transition-all hover:border-blue-500/40">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
              스폰서 추천
            </span>
            <span className="text-[11px] font-mono">GOOGLE ADSENSE</span>
          </div>
          <span className="text-[10px] text-slate-400">맞춤 추천 광고</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">
              티켓팅 고속 광랜 & 네이비즘 대체 필수 유틸리티 모음
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              정확한 서버 시계와 함께하는 스마트한 티켓팅 파트너 스폰서 링크입니다.
            </p>
          </div>
          <a
            href="mailto:you-n-us@naver.com?subject=[SERVERTIME] 인피드 광고 제휴 문의"
            className="self-start sm:self-auto flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition"
          >
            <span>상세보기</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  // Today Open Grid card style in-feed card
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/80 dark:bg-[#0A0E17]/70 p-4 transition-all hover:border-blue-500/40">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
            SPONSORED
          </span>
          <span className="text-[10px] font-mono text-slate-400">SERVERTIME AD</span>
        </div>

        <div className="aspect-[4/3] rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-[#080C14] flex flex-col items-center justify-center p-3 text-center mb-3">
          <Sparkles className="h-6 w-6 text-amber-500 mb-1" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            구글 반응형 네이티브 광고
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            관심사 기반 맞춤형 스폰서 상품
          </span>
        </div>

        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
          공식 예매처 제휴 혜택 및 서버 속도 최적화 가이드
        </h4>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>광고</span>
        <a
          href="mailto:you-n-us@naver.com?subject=[SERVERTIME] 광고 제휴 문의"
          className="hover:text-blue-500 transition-colors"
        >
          제휴 문의
        </a>
      </div>
    </div>
  );
}
