"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { Globe } from "lucide-react";

interface CityClock {
  name: string;
  cityKo: string;
  tz: string;
  offset: string;
}

const CITIES: CityClock[] = [
  { name: "Seoul", cityKo: "대한민국 (서울)", tz: "Asia/Seoul", offset: "UTC+9" },
  { name: "Tokyo", cityKo: "일본 (도쿄)", tz: "Asia/Tokyo", offset: "UTC+9" },
  { name: "London", cityKo: "영국 (런던)", tz: "Europe/London", offset: "UTC+0/1" },
  { name: "New York", cityKo: "미국 동부 (뉴욕)", tz: "America/New_York", offset: "UTC-5/-4" },
  { name: "Los Angeles", cityKo: "미국 서부 (LA)", tz: "America/Los_Angeles", offset: "UTC-8/-7" },
  { name: "Paris", cityKo: "프랑스 (파리)", tz: "Europe/Paris", offset: "UTC+1/2" },
  { name: "Sydney", cityKo: "호주 (시드니)", tz: "Australia/Sydney", offset: "UTC+10/11" },
  { name: "Singapore", cityKo: "싱가포르", tz: "Asia/Singapore", offset: "UTC+8" },
];

export default function WorldClockPage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
    const interval = setInterval(() => setCurrentDate(new Date()), 100);
    return () => clearInterval(interval);
  }, []);

  const getTimeInTz = (tz: string) => {
    if (!currentDate) return { time: "--:--:--", ms: "000", dateStr: "" };
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).formatToParts(currentDate);

      const h = parts.find((p) => p.type === "hour")?.value || "00";
      const m = parts.find((p) => p.type === "minute")?.value || "00";
      const s = parts.find((p) => p.type === "second")?.value || "00";
      const ms = String(currentDate.getMilliseconds()).padStart(3, "0");

      const dateStr = new Intl.DateTimeFormat("ko-KR", {
        timeZone: tz,
        month: "short",
        day: "numeric",
        weekday: "short",
      }).format(currentDate);

      return { time: `${h} : ${m} : ${s}`, ms, dateStr };
    } catch {
      return { time: "--:--:--", ms: "000", dateStr: "" };
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            <span>세계 표준시 비교 (World Clock)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            해외 글로벌 티켓팅, 콘서트 및 컨퍼런스 오픈 시점을 위한 주요 타임존 실시간 표준시 비교 도구입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CITIES.map((c) => {
            const data = getTimeInTz(c.tz);
            return (
              <div
                key={c.name}
                className="rounded-2xl premium-card p-5 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{c.cityKo}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {c.offset}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">{data.dateStr}</span>
                </div>

                <div className="pt-2">
                  <div suppressHydrationWarning className="flex items-baseline font-black tabular-nums font-mono text-2xl text-white">
                    <span>{data.time}</span>
                    <span className="text-blue-400 text-sm ml-1">.{data.ms}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
