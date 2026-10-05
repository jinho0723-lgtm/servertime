"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { AdSlot } from "@/components/common/AdSlot";
import { Clock, Play, Pause, RotateCcw, Bell } from "lucide-react";

export default function CountdownPage() {
  const [targetTime, setTargetTime] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!isRunning || !targetTime) return;

    const interval = setInterval(() => {
      const targetEpoch = new Date(targetTime).getTime();
      const diff = targetEpoch - Date.now();
      if (diff <= 0) {
        setRemainingMs(0);
        setIsRunning(false);
        // Sound alarm trigger
        try {
          const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch {}
      } else {
        setRemainingMs(diff);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isRunning, targetTime]);

  const formatRemaining = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const millis = ms % 1000;
    return {
      h: String(hours).padStart(2, "0"),
      m: String(mins).padStart(2, "0"),
      s: String(secs).padStart(2, "0"),
      ms: String(millis).padStart(3, "0"),
    };
  };

  const parsed = remainingMs !== null ? formatRemaining(remainingMs) : null;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-500" />
            <span>정밀 밀리초 카운트다운 타이머</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            목표 시각까지 남은 시간을 밀리초 단위로 실시간 계산하며 정각 도달 시 알림음을 재생합니다.
          </p>
        </div>

        <div className="rounded-3xl premium-card p-6 sm:p-10 flex flex-col items-center text-center space-y-8">
          {/* Target Input */}
          <div className="w-full max-w-md space-y-2 text-left">
            <label className="text-xs font-semibold text-slate-300">목표 시각 설정 (예: 티켓팅 오픈 시각)</label>
            <input
              type="datetime-local"
              step="1"
              value={targetTime}
              onChange={(e) => {
                setTargetTime(e.target.value);
                setIsRunning(false);
                setRemainingMs(null);
              }}
              className="w-full rounded-xl border border-slate-700 bg-[#0E1321] px-4 py-3 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Clock Display */}
          <div className="py-6">
            {parsed ? (
              <div className="flex items-baseline justify-center font-black tabular-clock text-white text-5xl sm:text-7xl md:text-8xl select-none">
                <span className="tabular-nums font-mono">{parsed.h} : {parsed.m} : {parsed.s}</span>
                <span className="text-blue-400 text-3xl sm:text-5xl ml-2 inline-block text-left tabular-nums font-mono w-[4ch]">.{parsed.ms}</span>
              </div>
            ) : (
              <div className="flex items-baseline justify-center font-black tabular-clock text-slate-600 text-5xl sm:text-7xl md:text-8xl select-none">
                <span className="tabular-nums font-mono">00 : 00 : 00</span>
                <span className="text-slate-700 text-3xl sm:text-5xl ml-2 inline-block text-left tabular-nums font-mono w-[4ch]">.000</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              disabled={!targetTime}
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all ${
                isRunning
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 disabled:opacity-50"
              }`}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isRunning ? "일시정지" : "카운트다운 시작"}</span>
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setRemainingMs(null);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              <span>초기화</span>
            </button>
          </div>
        </div>

        {/* AdSense Placement */}
        <AdSlot slotId="tools-countdown-bottom-responsive" format="auto" />
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
