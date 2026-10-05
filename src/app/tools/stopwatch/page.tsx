"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";

interface Lap {
  id: number;
  timeMs: number;
  diffMs: number;
}

export default function StopwatchPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startRef = useRef(0);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (isRunning) {
        const now = performance.now();
        setElapsedMs(accumulatedRef.current + (now - startRef.current));
        animId = requestAnimationFrame(tick);
      }
    };

    if (isRunning) {
      startRef.current = performance.now();
      animId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animId);
  }, [isRunning]);

  const toggleRun = () => {
    if (isRunning) {
      accumulatedRef.current = elapsedMs;
      setIsRunning(false);
    } else {
      startRef.current = performance.now();
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    accumulatedRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isRunning) return;
    const prevTime = laps.length > 0 ? laps[0].timeMs : 0;
    const newLap: Lap = {
      id: laps.length + 1,
      timeMs: elapsedMs,
      diffMs: elapsedMs - prevTime,
    };
    setLaps((prev) => [newLap, ...prev]);
  };

  const totalSec = Math.floor(elapsedMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const millis = Math.floor(elapsedMs % 1000);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>초정밀 스톱워치 (Lap 기록)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            requestAnimationFrame과 고성능 모노토닉 시계를 기반으로 오차 없이 밀리초를 측정합니다.
          </p>
        </div>

        <div className="rounded-3xl premium-card p-6 sm:p-10 flex flex-col items-center text-center space-y-8">
          {/* Display */}
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
              onClick={toggleRun}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all ${
                isRunning
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
              }`}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isRunning ? "일시정지" : "시작"}</span>
            </button>

            {isRunning && (
              <button
                onClick={handleLap}
                className="flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-950/40 px-5 py-3 text-sm font-semibold text-blue-300 hover:bg-blue-900/50"
              >
                <Flag className="h-4 w-4" />
                <span>랩(Lap)</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              <span>초기화</span>
            </button>
          </div>

          {/* Lap List */}
          {laps.length > 0 && (
            <div className="w-full max-w-md border-t border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 font-mono pb-1 border-b border-slate-800/60">
                <span>구간 (Lap)</span>
                <span>구간 기록</span>
                <span>전체 누적</span>
              </div>
              {laps.map((lap) => (
                <div key={lap.id} className="flex justify-between items-center py-1.5 font-mono">
                  <span className="text-slate-400">Lap {lap.id}</span>
                  <span className="text-blue-400 font-semibold">+{(lap.diffMs / 1000).toFixed(3)}s</span>
                  <span className="text-white font-bold">{(lap.timeMs / 1000).toFixed(3)}s</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
