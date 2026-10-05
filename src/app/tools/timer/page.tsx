"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { Timer as TimerIcon, Play, Pause, RotateCcw } from "lucide-react";

export default function TimerPage() {
  const [inputMinutes, setInputMinutes] = useState(3);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [totalMs, setTotalMs] = useState(3 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(3 * 60 * 1000);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const start = performance.now();
    const initialRem = remainingMs;

    const interval = setInterval(() => {
      const elapsed = performance.now() - start;
      const nextRem = Math.max(0, initialRem - elapsed);
      setRemainingMs(nextRem);

      if (nextRem <= 0) {
        setIsRunning(false);
        try {
          const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.type = "square";
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } catch {}
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isRunning]);

  const setCustomTime = (m: number, s: number) => {
    setIsRunning(false);
    setInputMinutes(m);
    setInputSeconds(s);
    const ms = (m * 60 + s) * 1000;
    setTotalMs(ms);
    setRemainingMs(ms);
  };

  const totalSec = Math.floor(remainingMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const millis = Math.floor(remainingMs % 1000);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <TimerIcon className="h-6 w-6 text-blue-500" />
            <span>정밀 타이머</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            설정한 시간만큼 정확하게 감소하는 고정밀 타이머입니다.
          </p>
        </div>

        <div className="rounded-3xl premium-card p-6 sm:p-10 flex flex-col items-center text-center space-y-8">
          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2">
            {[1, 3, 5, 10, 15].map((m) => (
              <button
                key={m}
                onClick={() => setCustomTime(m, 0)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  inputMinutes === m && inputSeconds === 0
                    ? "bg-blue-600 text-white"
                    : "border border-slate-800 bg-[#0E1321] text-slate-400 hover:text-white"
                }`}
              >
                {m}분
              </button>
            ))}
          </div>

          {/* Clock Display */}
          <div className="py-6">
            <div className="flex items-baseline justify-center font-black tabular-clock text-white text-5xl sm:text-7xl md:text-8xl select-none">
              <span className="tabular-nums font-mono">
                {String(mins).padStart(2, "0")} : {String(secs).padStart(2, "0")}
              </span>
              <span className="text-blue-400 text-3xl sm:text-5xl ml-2 inline-block text-left tabular-nums font-mono w-[4ch]">
                .{String(millis).padStart(3, "0")}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all ${
                isRunning
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
              }`}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isRunning ? "일시정지" : "타이머 시작"}</span>
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setRemainingMs(totalMs);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              <span>재설정</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
