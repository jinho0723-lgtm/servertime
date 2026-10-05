"use client";

import { useState } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { Calendar, ArrowRight } from "lucide-react";

export default function DateCalculatorPage() {
  const [baseDate, setBaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [addDays, setAddDays] = useState(100);
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 100);
    return d.toISOString().slice(0, 10);
  });

  // Mode 1: Base + Days
  const calculatedFuture = (() => {
    if (!baseDate) return "";
    const d = new Date(baseDate);
    d.setDate(d.getDate() + Number(addDays));
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  })();

  // Mode 2: Days between baseDate and targetDate
  const daysDifference = (() => {
    if (!baseDate || !targetDate) return 0;
    const t1 = new Date(baseDate).getTime();
    const t2 = new Date(targetDate).getTime();
    return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
  })();

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-500" />
            <span>날짜 및 D-Day 계산기</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            티켓 오픈 D-Day 계산 및 N일 후 날짜 계산을 정확하게 지원합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: D-Day Calculation */}
          <div className="rounded-3xl premium-card p-6 space-y-5">
            <h3 className="text-base font-bold text-white">D-Day 간격 계산</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">기준일</label>
                <input
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#0E1321] p-3 text-white dark:[color-scheme:dark] [color-scheme:light] cursor-pointer"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">목표일 (티켓 오픈일)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#0E1321] p-3 text-white dark:[color-scheme:dark] [color-scheme:light] cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-center">
              <span className="text-xs text-blue-300 block">남은 날짜</span>
              <div className="text-3xl font-black text-white font-mono mt-1">
                {daysDifference >= 0 ? `D-${daysDifference}` : `D+${Math.abs(daysDifference)}`}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {Math.abs(daysDifference)}일 {daysDifference >= 0 ? "남았습니다" : "지났습니다"}
              </span>
            </div>
          </div>

          {/* Card 2: N days later */}
          <div className="rounded-3xl premium-card p-6 space-y-5">
            <h3 className="text-base font-bold text-white">N일 후 날짜 계산</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">기준일</label>
                <input
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#0E1321] p-3 text-white dark:[color-scheme:dark] [color-scheme:light] cursor-pointer"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">더할 일수 (N일 후)</label>
                <input
                  type="number"
                  value={addDays}
                  onChange={(e) => setAddDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-[#0E1321] p-3 text-white"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
              <span className="text-xs text-emerald-300 block">계산된 결과일</span>
              <div className="text-xl font-black text-white font-mono mt-2">
                {calculatedFuture}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
