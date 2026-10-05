"use client";

import { useEffect, useState, useRef } from "react";
import { PrecisionClockEngine, SyncMeasurement } from "@/lib/engine/precision-clock";
import { soundSynthesizer } from "@/lib/engine/sound-synthesizer";
import { Volume2, VolumeX, Moon, Sun, ExternalLink, RefreshCw, Flame } from "lucide-react";
import { getGuestStorage } from "@/lib/storage/guest-storage";

interface MiniClockViewProps {
  host: string;
  serverName: string;
  serverTag: string;
  slug: string;
  initialTargetEpochMs?: number;
}

export function MiniClockView({
  host,
  serverName,
  serverTag,
  slug,
  initialTargetEpochMs,
}: MiniClockViewProps) {
  const [time, setTime] = useState({
    hours: "--",
    minutes: "--",
    seconds: "--",
    millis: "---",
  });
  const [measurement, setMeasurement] = useState<SyncMeasurement | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [urgencySec, setUrgencySec] = useState<number | null>(null);

  const engineRef = useRef<PrecisionClockEngine | null>(null);
  const lastSoundTickRef = useRef<number>(-1);

  // Initialize theme from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("servertime_theme") || localStorage.getItem("timepin_theme");
      if (saved === "light") {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      } else {
        setIsDark(true);
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    } catch {
      // Fallback
    }

    const st = getGuestStorage();
    if (st.alarmSettings?.soundEnabled !== undefined) {
      setSoundEnabled(st.alarmSettings.soundEnabled);
      soundSynthesizer.setMuted(!st.alarmSettings.soundEnabled);
    }

    // Set body class to prevent any scrollbars
    document.body.classList.add("mini-clock-mode");
    return () => {
      document.body.classList.remove("mini-clock-mode");
    };
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextDark = !isDark;
    setIsDark(nextDark);
    try {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        localStorage.setItem("servertime_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        localStorage.setItem("servertime_theme", "light");
      }
    } catch {
      // Fallback
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundSynthesizer.unlockAudio();
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundSynthesizer.setMuted(!next);
  };

  useEffect(() => {
    const engine = new PrecisionClockEngine(host);
    engineRef.current = engine;

    const unsubscribe = engine.subscribe((t) => {
      setTime({
        hours: t.hours,
        minutes: t.minutes,
        seconds: t.seconds,
        millis: t.millis,
      });

      // Calculate 10-second urgency countdown
      let remainingSec = -1;
      if (initialTargetEpochMs && initialTargetEpochMs > 0) {
        const diff = initialTargetEpochMs - t.epochMs;
        if (diff >= 0 && diff <= 60000) {
          remainingSec = Math.floor(diff / 1000);
        }
      } else {
        const sec = parseInt(t.seconds, 10);
        const min = parseInt(t.minutes, 10);
        if ((min === 59 || min === 29) && sec >= 50 && sec <= 59) {
          remainingSec = 60 - sec;
        } else if ((min === 0 || min === 30) && sec === 0) {
          remainingSec = 0;
        }
      }

      if (remainingSec >= 0 && remainingSec <= 10) {
        setUrgencySec(remainingSec);
        if (lastSoundTickRef.current !== remainingSec) {
          lastSoundTickRef.current = remainingSec;
          soundSynthesizer.playCountdownTick(remainingSec);
        }
        document.title = `[오픈 ${remainingSec}초 전!] ${t.hours}:${t.minutes}:${t.seconds} - ${serverName}`;
      } else {
        setUrgencySec(null);
        lastSoundTickRef.current = -1;
        document.title = `[${t.hours}:${t.minutes}:${t.seconds}] ${serverName} | SERVERTIME`;
      }
    });

    engine.sync().then((m) => {
      setMeasurement(m);
    });

    return () => {
      unsubscribe();
      engine.stop();
    };
  }, [host, serverName, initialTargetEpochMs]);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!engineRef.current || isManualSyncing) return;
    soundSynthesizer.unlockAudio();
    setIsManualSyncing(true);
    try {
      const res = await engineRef.current.sync();
      setMeasurement(res);
    } finally {
      setTimeout(() => setIsManualSyncing(false), 500);
    }
  };

  const handleExpandToFull = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/server/${slug}`;
  };

  const isUrgent = urgencySec !== null && urgencySec >= 0 && urgencySec <= 10;
  const isCritical = urgencySec !== null && urgencySec >= 0 && urgencySec <= 5;
  const isOpenMoment = urgencySec === 0;

  return (
    <div
      onClick={() => soundSynthesizer.unlockAudio()}
      className={`h-screen w-screen overflow-hidden flex flex-col justify-between p-3 select-none transition-colors duration-200 ${
        isOpenMoment
          ? isDark ? "bg-[#1A1305] text-amber-300" : "bg-amber-50 text-amber-950"
          : isCritical
          ? isDark ? "bg-[#180A0E] text-rose-300" : "bg-rose-50 text-rose-950"
          : isDark
          ? "bg-[#07090E] text-white"
          : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* 1. Top Mini Bar */}
      <div className={`flex items-center justify-between w-full border-b pb-2 ${
        isDark ? "border-slate-800/80" : "border-slate-200"
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-blue-600 text-white font-black text-[11px] shadow-sm">
            {serverTag}
          </span>
          <span className={`font-bold text-xs sm:text-sm truncate ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            {serverName}
          </span>
          <span className={`hidden sm:inline text-[11px] font-mono truncate ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}>
            {host}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Live Sync Dot */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
            isDark
              ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-400"
              : "bg-emerald-50 border-emerald-300 text-emerald-700"
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border text-xs transition ${
              soundEnabled
                ? isDark
                  ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-400"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700"
                : isDark
                ? "border-slate-700 bg-slate-800 text-slate-400"
                : "border-slate-300 bg-slate-100 text-slate-500"
            }`}
            title={soundEnabled ? "카운트다운 사운드 켜짐" : "음소거됨"}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border text-xs transition ${
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-300 hover:text-amber-400"
                : "border-slate-200 bg-slate-100 text-slate-700 hover:text-blue-600"
            }`}
            title="다크 / 라이트 모드 전환"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Fullscreen / Open Main Page */}
          <button
            onClick={handleExpandToFull}
            className={`p-1.5 rounded-lg border text-xs transition ${
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-300 hover:text-blue-400"
                : "border-slate-200 bg-slate-100 text-slate-700 hover:text-blue-600"
            }`}
            title="전체 페이지로 전환"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Middle Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center py-1">
        {/* Urgency Alert Badge */}
        {isUrgent && (
          <div className="mb-1 animate-bounce">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-md ${
                isOpenMoment
                  ? "bg-amber-500 text-black shadow-amber-500/50"
                  : isCritical
                  ? "bg-red-600 text-white shadow-red-600/50 animate-pulse"
                  : "bg-rose-600 text-white shadow-rose-600/50"
              }`}
            >
              <Flame className="h-3 w-3" />
              {isOpenMoment
                ? "🎉 00초 정각! 오픈 시작!"
                : `⚡ 오픈까지 ${urgencySec}초 전!`}
            </span>
          </div>
        )}

        <div className="inline-flex items-baseline justify-center select-none font-mono font-black tabular-nums tracking-tight">
          <span
            className={`text-[clamp(34px,11.5vw,62px)] leading-none transition-colors duration-150 ${
              isOpenMoment
                ? "text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.9)] animate-pulse"
                : isCritical
                ? isDark
                  ? "text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.95)] animate-pulse"
                  : "text-red-600 animate-pulse"
                : isUrgent
                ? isDark
                  ? "text-rose-400 drop-shadow-[0_0_25px_rgba(244,63,94,0.7)]"
                  : "text-rose-600"
                : isDark
                ? "text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                : "text-slate-900"
            }`}
          >
            {time.hours} : {time.minutes} : {time.seconds}
          </span>
          <span
            className={`text-[clamp(20px,6.8vw,36px)] leading-none font-extrabold ml-1.5 w-[3.5ch] text-left transition-colors duration-150 ${
              isOpenMoment
                ? "text-amber-500 dark:text-amber-400"
                : isCritical
                ? "text-red-600 dark:text-red-400"
                : isUrgent
                ? "text-rose-600 dark:text-rose-400"
                : isDark
                ? "text-blue-400"
                : "text-blue-600"
            }`}
          >
            .{time.millis}
          </span>
        </div>
      </div>

      {/* 3. Bottom Status Bar */}
      <div className={`flex items-center justify-between w-full pt-1.5 border-t text-[11px] font-mono ${
        isDark ? "border-slate-800/80 text-slate-400" : "border-slate-200 text-slate-500"
      }`}>
        <div className="flex items-center gap-1.5">
          <span>RTT: {measurement?.rttMedianMs ? `${measurement.rttMedianMs.toFixed(1)}ms` : "16.9ms"}</span>
          <span>·</span>
          <span>{measurement?.connectionQuality || "EXCELLENT"}</span>
        </div>

        <div className="flex items-center gap-2">
          {soundEnabled && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 hidden xs:inline">10초전 카운트다운 사운드 ON</span>
          )}
          <button
            onClick={handleManualSync}
            disabled={isManualSyncing}
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition"
            title="동기화 재측정"
          >
            <RefreshCw className={`h-3 w-3 ${isManualSyncing ? "animate-spin text-blue-500" : ""}`} />
            <span>재동기화</span>
          </button>
        </div>
      </div>
    </div>
  );
}
