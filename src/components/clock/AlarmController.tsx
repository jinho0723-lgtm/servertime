"use client";

import { useState, useEffect } from "react";
import { Bell, Volume2, VolumeX, CheckSquare, Square, Sparkles, Play } from "lucide-react";
import { getGuestStorage, saveGuestStorage } from "@/lib/storage/guest-storage";
import { soundSynthesizer } from "@/lib/engine/sound-synthesizer";

interface AlarmControllerProps {
  currentEpochMs?: number;
  targetOpenEpochMs?: number;
}

export function AlarmController({ currentEpochMs = Date.now(), targetOpenEpochMs }: AlarmControllerProps) {
  const [settings, setSettings] = useState<{
    enabled10m: boolean;
    enabled5m: boolean;
    enabled1m: boolean;
    enabled30s: boolean;
    enabled10s: boolean;
    enabled5s: boolean;
    enabledOnHour: boolean;
    soundEnabled: boolean;
  }>({
    enabled10m: false,
    enabled5m: true,
    enabled1m: true,
    enabled30s: true,
    enabled10s: true,
    enabled5s: true,
    enabledOnHour: true,
    soundEnabled: true,
  });

  const [testPlaying, setTestPlaying] = useState(false);

  useEffect(() => {
    const st = getGuestStorage();
    if (st.alarmSettings) {
      setSettings((prev) => ({
        ...prev,
        ...st.alarmSettings,
      }));
      soundSynthesizer.setMuted(!st.alarmSettings.soundEnabled);
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    soundSynthesizer.unlockAudio();
    const updated = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(updated);
    if (key === "soundEnabled") {
      soundSynthesizer.setMuted(!updated.soundEnabled);
    }
    const st = getGuestStorage();
    st.alarmSettings = {
      ...st.alarmSettings,
      [key]: updated[key],
    };
    saveGuestStorage(st);
  };

  const handleTestSound = () => {
    soundSynthesizer.unlockAudio();
    setTestPlaying(true);
    // Preview countdown tick (3, 2, 1, 0 Fanfare)
    soundSynthesizer.playCountdownTick(3);
    setTimeout(() => soundSynthesizer.playCountdownTick(2), 350);
    setTimeout(() => soundSynthesizer.playCountdownTick(1), 700);
    setTimeout(() => {
      soundSynthesizer.playCountdownTick(0);
      setTestPlaying(false);
    }, 1050);
  };

  const alarmOptions = [
    { key: "enabledOnHour" as const, label: "정각 알림 (00초)" },
    { key: "enabled10s" as const, label: "10초 전 긴박 카운트다운" },
    { key: "enabled5s" as const, label: "5초 전 초단위 비프" },
    { key: "enabled30s" as const, label: "30초 전 사전 경보" },
    { key: "enabled1m" as const, label: "1분 전 준비 알림" },
    { key: "enabled5m" as const, label: "5분 전 대기 알림" },
  ];

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-[#1E2538] bg-white dark:bg-[#0C101A] p-5 shadow-sm dark:shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">알람 및 사운드 설정</h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
            (네이비즘 스타일 10초 긴박 카운트다운)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Mute/Unmute Toggle */}
          <button
            onClick={() => handleToggle("soundEnabled")}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              settings.soundEnabled
                ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0E1321] text-slate-600 dark:text-slate-400"
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5 text-slate-500" />}
            <span>{settings.soundEnabled ? "사운드 켜짐" : "음소거"}</span>
          </button>

          {/* Test Sound Button */}
          <button
            onClick={handleTestSound}
            disabled={testPlaying}
            className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-50 dark:bg-blue-600/20 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-600/30 transition disabled:opacity-50"
          >
            <Play className={`h-3 w-3 ${testPlaying ? "animate-spin" : ""}`} />
            <span>{testPlaying ? "재생 중..." : "소리 미리듣기"}</span>
          </button>
        </div>
      </div>

      {/* Preset Checkbox Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {alarmOptions.map((item) => {
          const isChecked = !!settings[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleToggle(item.key)}
              className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                isChecked
                  ? "border-blue-400/60 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-200 shadow-sm shadow-blue-500/10 font-bold"
                  : "border-slate-200 dark:border-[#1A2234] bg-slate-50 dark:bg-[#0E1321] text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {isChecked ? (
                <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-amber-200/80 dark:border-slate-800 bg-amber-50/70 dark:bg-[#090C16] p-3 text-[11px] text-slate-700 dark:text-slate-400 flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
        <span>
          정각 및 30분, 혹은 사용자가 설정한 오픈 10초 전부터 시계 숫자가 붉은색으로 긴박하게 변하며 초 단위 카운트다운 사운드가 점진적으로 울립니다.
        </span>
      </div>
    </div>
  );
}
