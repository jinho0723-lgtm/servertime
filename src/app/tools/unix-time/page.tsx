"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { Binary, Copy, Check } from "lucide-react";

export default function UnixTimePage() {
  const [currentSec, setCurrentSec] = useState(() => Math.floor(Date.now() / 1000));
  const [currentMs, setCurrentMs] = useState(() => Date.now());
  const [inputEpoch, setInputEpoch] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentMs(now);
      setCurrentSec(Math.floor(now / 1000));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert input
  const convertedDate = (() => {
    const val = Number(inputEpoch.trim());
    if (isNaN(val) || val <= 0) return "유효한 Epoch 시간을 입력하세요.";
    const epochMs = val > 10000000000 ? val : val * 1000;
    try {
      return new Date(epochMs).toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return "변환 오류";
    }
  })();

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Binary className="h-6 w-6 text-blue-500" />
            <span>Unix Timestamp 변환기</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            개발자 및 서버 연동을 위한 초/밀리초 단위 유닉스 타임스탬프 상호 변환기입니다.
          </p>
        </div>

        {/* Current Live Epoch */}
        <div className="rounded-3xl premium-card p-6 sm:p-8 space-y-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">현재 실시간 Unix Epoch</span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">{currentSec}</span>
                <span className="text-xs text-blue-400 font-mono">초 (Seconds)</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                밀리초: <span className="text-slate-200">{currentMs}</span> ms
              </div>
            </div>

            <button
              onClick={() => handleCopy(String(currentSec))}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "복사됨!" : "초 단위 복사"}</span>
            </button>
          </div>
        </div>

        {/* Converter Tool */}
        <div className="rounded-3xl premium-card p-6 sm:p-8 space-y-5">
          <h3 className="text-base font-bold text-white">타임스탬프 ➔ 한국 표준시(KST) 변환</h3>

          <div className="space-y-3">
            <input
              type="text"
              value={inputEpoch}
              onChange={(e) => setInputEpoch(e.target.value)}
              placeholder="예: 1775088000"
              className="w-full rounded-xl border border-slate-700 bg-[#0E1321] p-3 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
            />

            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30">
              <span className="text-xs text-slate-400 block">변환된 날짜/시각 (KST)</span>
              <span className="text-lg font-bold text-white font-mono mt-1 block">
                {convertedDate}
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
