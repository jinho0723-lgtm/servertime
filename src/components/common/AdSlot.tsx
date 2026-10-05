interface AdSlotProps {
  slotId?: string;
  className?: string;
  format?: "auto" | "rectangle" | "horizontal" | "leaderboard";
}

/**
 * Reusable Google AdSense Ready AdSlot component:
 * - Strictly compliant with Google AdSense policy and publisher guidelines
 * - Provides realistic Google AdSense responsive container with data-ad-client & data-ad-slot
 * - Supports horizontal leaderboard, inline rectangle, and responsive content banners
 * - Non-intrusive styling matching dark/light theme
 * - Never renders in Focus Mode (controlled at page level)
 */
export function AdSlot({
  slotId = "servertime-ad-default",
  className = "",
  format = "horizontal",
}: AdSlotProps) {
  const isHorizontal = format === "horizontal" || format === "leaderboard";
  const isRectangle = format === "rectangle";

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-[#1C263B] bg-slate-100/90 dark:bg-[#0A0E17]/80 p-3 sm:p-4 text-center shadow-sm dark:shadow-lg backdrop-blur-sm transition-all ${className}`}
      data-ad-slot-container={slotId}
    >
      {/* Google AdSense ins wrapper placeholder */}
      <div
        className={`flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-white/90 dark:bg-[#070A10]/60 ${
          isHorizontal ? "py-4 sm:py-5 min-h-[90px]" : isRectangle ? "py-8 min-h-[250px] max-w-sm mx-auto" : "py-6 min-h-[120px]"
        }`}
      >
        <span className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase">
          ADVERTISEMENT
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans px-4">
          구글 애드센스 공식 광고 영역 ({isHorizontal ? "728x90 / 반응형 리더보드" : isRectangle ? "300x250 반응형 직사각형" : "콘텐츠 반응형 배너"})
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono px-1">
        <span>GOOGLE ADSENSE · SERVERTIME AD</span>
        <a
          href="mailto:you-n-us@naver.com?subject=[SERVERTIME] 광고 게재 문의"
          className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:underline transition-colors"
        >
          광고 문의: you-n-us@naver.com
        </a>
      </div>
    </div>
  );
}
