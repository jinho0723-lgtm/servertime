"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/utils";

interface TargetCountdownProps {
  targetEpochMs: number;
  currentEpochMs: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function TargetCountdown({
  targetEpochMs,
  currentEpochMs,
  label = "OPEN까지",
  size = "md",
}: TargetCountdownProps) {
  const [cd, setCd] = useState(() => formatCountdown(targetEpochMs, currentEpochMs || Date.now()));

  useEffect(() => {
    let animId: number;
    const tick = () => {
      setCd(formatCountdown(targetEpochMs, Date.now()));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [targetEpochMs]);

  if (cd.isPast) {
    return (
      <div className="flex flex-col items-center">
        {label && <span className="text-[11px] font-semibold tracking-wider text-rose-400 uppercase">{label}</span>}
        <span className="text-3xl font-black text-rose-500 animate-pulse tracking-widest mt-1">
          OPEN NOW
        </span>
      </div>
    );
  }

  const isLarge = size === "lg";

  return (
    <div suppressHydrationWarning className="flex flex-col items-center select-none">
      {label && (
        <span className="text-[11px] font-bold tracking-wider text-rose-400/90 uppercase">
          {label}
        </span>
      )}
      <div
        suppressHydrationWarning
        className={`mt-0.5 flex items-baseline font-bold tabular-clock text-rose-500 ${
          isLarge ? "text-5xl sm:text-6xl md:text-7xl" : "text-2xl sm:text-3xl"
        }`}
      >
        <span suppressHydrationWarning className="drop-shadow-[0_0_20px_rgba(244,63,94,0.4)] tabular-nums font-mono">
          {cd.hours} : {cd.minutes} : {cd.seconds}
        </span>
        <span
          suppressHydrationWarning
          className={`ml-1 text-rose-400 font-semibold inline-block text-left tabular-nums font-mono w-[4ch] ${isLarge ? "text-2xl sm:text-3xl" : "text-sm sm:text-base"}`}
        >
          .{cd.millis}
        </span>
      </div>
    </div>
  );
}
