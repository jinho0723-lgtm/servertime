"use client";

import { useEffect, useState } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { TargetCountdown } from "./TargetCountdown";
import { formatPrecisionTime } from "@/lib/utils";

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverName: string;
  host: string;
  currentEpochMs: number;
  targetOpenEpochMs?: number;
  rttMs?: number;
  estimatedErrorMs?: number;
  qualityGrade?: string;
}

export function FocusModeModal({
  isOpen,
  onClose,
  serverName,
  host,
  currentEpochMs,
  targetOpenEpochMs = Date.now() + 61258,
  rttMs = 21,
  estimatedErrorMs = 18,
  qualityGrade = "EXCELLENT",
}: FocusModeModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localEpoch, setLocalEpoch] = useState(currentEpochMs || Date.now());

  useEffect(() => {
    if (!isOpen) return;
    let animId: number;
    const loop = () => {
      setLocalEpoch(Date.now());
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const { hours, minutes, seconds, millis } = formatPrecisionTime(localEpoch);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#04060A] p-6 sm:p-10 text-white select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex w-full items-center justify-between max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-sm shadow-lg shadow-blue-600/30">
            NOL
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">{serverName}</h2>
            <p className="text-xs text-slate-400 font-mono">{host}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:border-slate-600 hover:text-white"
            title="전체화면 전환"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:border-rose-600 hover:text-rose-400"
            title="집중모드 종료 (ESC)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Center Proportions */}
      <div className="my-auto flex flex-col items-center justify-center text-center space-y-8 sm:space-y-12 w-full px-2">
        {/* Large Main Clock */}
        <div className="w-full flex items-center justify-center overflow-hidden">
          <div className="inline-flex items-baseline justify-center font-black tracking-tight text-white tabular-clock select-none whitespace-nowrap">
            <span className="text-[clamp(52px,12vw,140px)] leading-none drop-shadow-[0_0_40px_rgba(59,130,246,0.35)] tabular-nums font-mono">
              {hours} : {minutes} : {seconds}
            </span>
            <span className="text-[clamp(30px,7.5vw,88px)] leading-none font-black text-blue-400 ml-2 sm:ml-4 drop-shadow-[0_0_25px_rgba(96,165,250,0.55)] inline-block text-left tabular-nums font-mono w-[4ch]">
              .{millis}
            </span>
          </div>
        </div>

        {/* Coral Target OPEN Countdown */}
        <div className="flex flex-col items-center select-none">
          <span className="text-xs sm:text-sm font-black tracking-[0.2em] text-slate-400 uppercase mb-1">
            OPEN IN
          </span>
          <div className="inline-flex items-baseline font-black tabular-clock text-rose-500 whitespace-nowrap">
            <span className="text-[clamp(36px,9vw,90px)] leading-none drop-shadow-[0_0_25px_rgba(244,63,94,0.45)] tabular-nums font-mono">
              00 : 01
            </span>
            <span className="text-[clamp(22px,5.5vw,54px)] leading-none font-bold text-rose-400 ml-1.5 sm:ml-2 inline-block text-left tabular-nums font-mono w-[4ch]">
              .258
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Clean Minimal Status matching: ● SYNCED   RTT 21ms   CONNECTION EXCELLENT */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm font-mono text-slate-300 border-t border-slate-900/80 pt-4 w-full max-w-lg">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SYNCED</span>
        </div>
        <span>RTT {rttMs}ms</span>
        <span className="text-blue-400 font-bold">CONNECTION EXCELLENT</span>
      </div>
    </div>
  );
}
