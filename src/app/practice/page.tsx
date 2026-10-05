"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { RotateCcw, Zap, CheckCircle2 } from "lucide-react";
import { recordPracticeResult, getGuestStorage } from "@/lib/storage/guest-storage";
import { AdSlot } from "@/components/common/AdSlot";
import confetti from "canvas-confetti";

export default function PracticeCenterPage() {
  const [activeTab, setActiveTab] = useState<"timing" | "seat" | "queue" | "reaction" | "records">("timing");

  const [resultDiff, setResultDiff] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [records, setRecords] = useState<{ id: string; type: string; diffMs: number; percentile: number; recordedAt: number }[]>([]);

  // Seat Drill State
  const [seats, setSeats] = useState<{ id: number; status: "available" | "taken" | "selected" }[]>([]);
  const [seatScore, setSeatScore] = useState<number | null>(null);
  const [seatDrillActive, setSeatDrillActive] = useState(false);
  const [grapeCount, setGrapeCount] = useState<number>(3); // Number of available grapes (1, 3, 5, 10, or random)
  const seatStartTimeRef = useRef(0);

  // Queue Drill State
  const [queueCount, setQueueCount] = useState(1482);
  const [queueActive, setQueueActive] = useState(false);
  const [queueFinished, setQueueFinished] = useState(false);

  // Reaction Test State
  const [reactionState, setReactionState] = useState<"waiting" | "ready" | "go" | "early">("waiting");
  const [reactionScore, setReactionScore] = useState<number | null>(null);
  const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reactionStartRef = useRef(0);

  useEffect(() => {
    // Read local records only from client
    const st = getGuestStorage();
    if (st.practiceRecords) {
      setRecords(st.practiceRecords);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "seat" && seats.length === 0) {
      startSeatDrill();
    }
  }, [activeTab]);

  // Compute personal best stats only when records actually exist
  const bestRecord = records.length > 0 ? Math.min(...records.map((r) => r.diffMs)) : null;
  const bestPercentile = records.length > 0 ? Math.min(...records.map((r) => r.percentile)) : null;
  const latestRecord = records.length > 0 ? records[0] : null;

  const handleTimingClick = () => {
    // Instant exact real-time measurement with zero React render latency
    const now = Date.now();
    const ms = now % 1000;
    const diff = ms > 500 ? 1000 - ms : ms;
    const diffSec = diff / 1000;

    let pct = 50;
    if (diff < 30) pct = 1;
    else if (diff < 70) pct = 3;
    else if (diff < 150) pct = 7;
    else if (diff < 300) pct = 15;
    else if (diff < 500) pct = 30;
    else pct = 60;

    setResultDiff(diffSec);
    setPercentile(pct);
    recordPracticeResult("timing", Math.round(diffSec * 1000), pct);
    setRecords(getGuestStorage().practiceRecords);

    if (pct <= 10) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && activeTab === "timing") {
        e.preventDefault();
        handleTimingClick();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeTab]);

  // Seat Drill
  const TOTAL_SEATS = 320; // 20 columns x 16 rows (Realistic ultra-dense ticketing hall)

  const startSeatDrill = (customCount?: number) => {
    const targetGrapes = customCount !== undefined ? customCount : grapeCount;
    setSeatDrillActive(true);
    setSeatScore(null);

    // Initialize all as taken first
    const initialSeats = Array.from({ length: TOTAL_SEATS }, (_, i) => ({
      id: i,
      status: "taken" as "available" | "taken" | "selected",
    }));

    // Randomly place exact number of available grapes
    const indices = Array.from({ length: TOTAL_SEATS }, (_, i) => i);
    // Shuffle indices (Fisher-Yates)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const countToPick = Math.min(TOTAL_SEATS, Math.max(1, targetGrapes));
    for (let k = 0; k < countToPick; k++) {
      initialSeats[indices[k]].status = "available";
    }

    setSeats(initialSeats);
    seatStartTimeRef.current = performance.now();
  };

  const handleSelectSeat = (id: number) => {
    const targetSeat = seats.find((s) => s.id === id);
    if (!targetSeat || targetSeat.status !== "available") return;

    const elapsed = Math.round(performance.now() - seatStartTimeRef.current);
    setSeats((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "selected" as const } : s))
    );
    setSeatScore(elapsed);
    setSeatDrillActive(false);

    let pct = 20;
    if (elapsed < 180) pct = 1;
    else if (elapsed < 250) pct = 3;
    else if (elapsed < 350) pct = 8;
    else if (elapsed < 500) pct = 15;

    recordPracticeResult("seat", elapsed, pct);
    setRecords(getGuestStorage().practiceRecords);
    confetti({ particleCount: 50, spread: 50 });
  };

  // Queue Drill Simulation
  const startQueueDrill = () => {
    setQueueCount(1482);
    setQueueActive(true);
    setQueueFinished(false);
  };

  useEffect(() => {
    if (!queueActive) return;
    const interval = setInterval(() => {
      setQueueCount((prev) => {
        const step = Math.floor(Math.random() * 120) + 80;
        if (prev - step <= 0) {
          clearInterval(interval);
          setQueueActive(false);
          setQueueFinished(true);
          confetti({ particleCount: 70, spread: 60 });
          return 0;
        }
        return prev - step;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [queueActive]);

  // Reaction Test
  const startReactionTest = () => {
    setReactionState("ready");
    setReactionScore(null);
    const delay = Math.floor(Math.random() * 2500) + 1500; // 1.5s - 4s
    reactionTimerRef.current = setTimeout(() => {
      setReactionState("go");
      reactionStartRef.current = performance.now();
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionState === "ready") {
      // False start
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      setReactionState("early");
    } else if (reactionState === "go") {
      const elapsed = Math.round(performance.now() - reactionStartRef.current);
      setReactionScore(elapsed);
      setReactionState("waiting");

      let pct = 30;
      if (elapsed < 180) pct = 1;
      else if (elapsed < 220) pct = 3;
      else if (elapsed < 260) pct = 8;
      else if (elapsed < 320) pct = 15;

      recordPracticeResult("reaction", elapsed, pct);
      setRecords(getGuestStorage().practiceRecords);
      confetti({ particleCount: 60, spread: 55 });
    }
  };

// Isolated Live Clock Display for Timing Drill - guarantees 60fps with ZERO parent re-renders
function TimingClockVisual() {
  const [timeStr, setTimeStr] = useState({ hms: "-- : -- : --", ms: ".000" });

  useEffect(() => {
    let rafId: number;
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      const ms = String(now.getMilliseconds()).padStart(3, "0");
      setTimeStr({ hms: `${h} : ${m} : ${s}`, ms: `.${ms}` });
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div suppressHydrationWarning className="flex items-baseline justify-center font-black tabular-clock text-white text-5xl sm:text-7xl md:text-8xl select-none">
      <span suppressHydrationWarning className="tabular-nums font-mono">{timeStr.hms}</span>
      <span suppressHydrationWarning className="text-blue-400 text-3xl sm:text-5xl ml-2 inline-block text-left tabular-nums font-mono w-[4ch]">{timeStr.ms}</span>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Real Personal Record Summary Bar */}
        {records.length > 0 && (
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl premium-card text-center">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">내 최고 기록</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {bestRecord !== null ? `${(bestRecord / 1000).toFixed(3)}초` : "--"}
              </span>
            </div>
            <div className="border-x border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">최근 시도</span>
              <span className="text-sm font-bold text-white font-mono">
                {latestRecord ? `${(latestRecord.diffMs / 1000).toFixed(3)}초` : "--"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">개인 최고 순위</span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {bestPercentile !== null ? `상위 ${bestPercentile}%` : "--"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 rounded-2xl premium-card p-1.5">
          <button
            onClick={() => setActiveTab("timing")}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
              activeTab === "timing" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            타이밍 연습
          </button>
          <button
            onClick={() => {
              setActiveTab("seat");
              if (!seatDrillActive) startSeatDrill();
            }}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
              activeTab === "seat" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            좌석 선택 연습
          </button>
          <button
            onClick={() => {
              setActiveTab("queue");
              if (!queueActive && !queueFinished) startQueueDrill();
            }}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
              activeTab === "queue" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            대기열 연습
          </button>
          <button
            onClick={() => setActiveTab("reaction")}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
              activeTab === "reaction" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            반응속도 테스트
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
              activeTab === "records" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            내 기록
          </button>
        </div>

        {/* Timing Drill Section */}
        {activeTab === "timing" && (
          <div className="rounded-3xl premium-card p-6 sm:p-10 flex flex-col items-center text-center space-y-6">
            <div className="text-xs sm:text-sm font-semibold text-slate-400">
              정각 <span className="text-blue-400 font-mono font-bold">:00초:000</span>이 되면 버튼 또는 SPACE바를 누르세요!
            </div>

            <TimingClockVisual />

            <button
              onClick={handleTimingClick}
              className="w-full max-w-md rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base sm:text-lg font-black text-white shadow-xl shadow-blue-600/30 transition-all hover:brightness-110 active:scale-95"
            >
              예매하기 (SPACE)
            </button>

            {resultDiff !== null && (
              <div className="w-full max-w-md rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5 text-left flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">이번 시도 결과</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {resultDiff.toFixed(3)}초
                    </span>
                    <span className="text-xs text-slate-400">오차</span>
                  </div>
                  <span className="text-xs text-blue-300 font-medium">정확하게 클릭했습니다!</span>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-black text-amber-400">
                    <span>👑 상위 {percentile}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seat Picker Drill */}
        {activeTab === "seat" && (
          <div className="rounded-3xl premium-card p-5 sm:p-8 flex flex-col items-center text-center space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full max-w-2xl gap-3">
              <div className="text-left">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🍇 실전 포도알 좌석 선점 훈련</span>
                </h3>
                <p className="text-xs text-slate-400">실제 티켓팅 창의 미세한 좌석 크기! 보라색 포도알이 뜨는 즉시 번개처럼 클릭하세요.</p>
              </div>
              <button
                onClick={() => startSeatDrill()}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>재도전</span>
              </button>
            </div>

            {/* Grape Count Selector */}
            <div className="flex items-center gap-2 w-full max-w-2xl bg-[#090D18] p-2.5 rounded-2xl border border-slate-800 text-xs justify-between flex-wrap">
              <span className="text-slate-400 font-medium pl-1">잔여 포도알 개수:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 5, 8, 12].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => {
                      setGrapeCount(cnt);
                      startSeatDrill(cnt);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      grapeCount === cnt
                        ? "bg-purple-600 text-white shadow-sm shadow-purple-600/50"
                        : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {cnt}개
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full max-w-2xl py-1 rounded bg-slate-800/80 text-[10px] font-mono text-slate-400 uppercase tracking-widest border border-slate-750">
              STAGE SCREEN (무대 방향)
            </div>

            {/* Ultra-realistic Tiny Seat Grid (20 columns x 16 rows = 320 seats) */}
            <div className="p-3 sm:p-4 rounded-2xl border border-slate-800 bg-[#080B12] overflow-x-auto max-w-full">
              <div
                className="grid gap-1 min-w-[280px]"
                style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}
              >
                {seats.map((seat) => (
                  <button
                    key={seat.id}
                    disabled={seat.status !== "available"}
                    onClick={() => handleSelectSeat(seat.id)}
                    className={`h-[11px] w-[11px] sm:h-3 sm:w-3 rounded-[2px] transition-all duration-75 mx-auto ${
                      seat.status === "available"
                        ? "bg-[#8B5CF6] hover:bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.9)] ring-1 ring-[#C4B5FD] animate-pulse cursor-pointer scale-125 z-10"
                        : seat.status === "selected"
                        ? "bg-[#10B981] ring-1 ring-[#6EE7B7]"
                        : "bg-[#1E293B]/40 opacity-25 cursor-not-allowed"
                    }`}
                    title={seat.status === "available" ? "예매 가능 좌석 (포도알)" : "예매 완료 좌석"}
                  />
                ))}
              </div>
            </div>

            {seatScore !== null && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 px-4 py-2.5 text-emerald-400 font-bold text-xs sm:text-sm animate-in fade-in">
                🎉 포도알 선점 성공! 반응속도: <span className="font-mono text-base text-emerald-300">{seatScore}</span> ms
              </div>
            )}
          </div>
        )}

        {/* Queue Simulation */}
        {activeTab === "queue" && (
          <div className="rounded-3xl premium-card p-8 text-center space-y-6">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">가상 대기열 시뮬레이션</h3>
              <button
                onClick={startQueueDrill}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>다시 시뮬레이션</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 max-w-md mx-auto">
              실제 티켓팅 환경의 대기열 시스템을 재현했습니다. 새로고침을 누르지 않고 순번이 줄어드는 과정을 체감해보세요.
            </p>

            <div className="max-w-md mx-auto p-6 rounded-2xl border border-blue-900/40 bg-[#090D18] space-y-4">
              {queueFinished ? (
                <div className="space-y-3 py-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <div className="text-2xl font-black text-emerald-400">대기 완료! 입장 성공</div>
                  <p className="text-xs text-slate-300">좌석 배치도로 바로 이동할 준비가 되었습니다.</p>
                </div>
              ) : (
                <>
                  <span className="text-xs font-mono text-blue-400">현재 접속 대기 중</span>
                  <div className="text-4xl font-black text-white font-mono">{queueCount.toLocaleString()} 번째</div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-300"
                      style={{ width: `${Math.max(5, ((1482 - queueCount) / 1482) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    예상 대기 시간: 약 {Math.max(1, Math.round(queueCount / 80))}초 (새로고침 시 순번이 초기화됩니다)
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Reaction Time Test */}
        {activeTab === "reaction" && (
          <div className="rounded-3xl premium-card p-8 text-center space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <span>반응속도 테스트 (Red ➔ Green)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                화면이 초록색으로 바뀌는 순간 최대한 빠르게 클릭하세요!
              </p>
            </div>

            <div
              onClick={handleReactionClick}
              className={`max-w-md mx-auto h-64 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer select-none transition-all shadow-xl ${
                reactionState === "waiting"
                  ? "bg-[#0E1424] border border-blue-500/40 hover:border-blue-400"
                  : reactionState === "ready"
                  ? "bg-rose-950/80 border border-rose-600"
                  : reactionState === "go"
                  ? "bg-emerald-600 border border-emerald-400 text-white"
                  : "bg-amber-950/80 border border-amber-600"
              }`}
            >
              {reactionState === "waiting" && (
                <div className="space-y-2">
                  <span className="text-base font-bold text-white">클릭하여 시작</span>
                  <p className="text-xs text-slate-400">준비되면 화면을 클릭하세요</p>
                </div>
              )}

              {reactionState === "ready" && (
                <div className="space-y-2">
                  <span className="text-lg font-black text-rose-300">초록색이 되면 클릭하세요!</span>
                  <p className="text-xs text-rose-400/80">아직 누르지 마세요...</p>
                </div>
              )}

              {reactionState === "go" && (
                <div className="space-y-2">
                  <span className="text-2xl font-black text-white">지금 클릭하세요!</span>
                </div>
              )}

              {reactionState === "early" && (
                <div className="space-y-2">
                  <span className="text-lg font-bold text-amber-300">너무 일찍 클릭했습니다!</span>
                  <p className="text-xs text-slate-400">다시 시도하려면 클릭하세요</p>
                </div>
              )}
            </div>

            {reactionState === "waiting" && (
              <button
                onClick={startReactionTest}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500"
              >
                테스트 시작
              </button>
            )}

            {reactionScore !== null && (
              <div className="max-w-md mx-auto p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 font-bold text-sm">
                🎉 반응속도: {reactionScore} ms (기록이 로컬에 저장되었습니다)
              </div>
            )}
          </div>
        )}

        {/* Local Records Tab */}
        {activeTab === "records" && (
          <div className="rounded-3xl premium-card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">브라우저 로컬 연습 기록</h3>
              <span className="text-xs text-emerald-400 font-mono">100% 게스트 로컬 저장</span>
            </div>
            {records.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                아직 저장된 연습 기록이 없습니다. 타이밍 연습을 시작해보세요!
              </div>
            ) : (
              <div className="space-y-2">
                {records.map((r, i) => (
                  <div key={r.id || i} className="flex justify-between items-center p-3 rounded-xl bg-[#0E1321] text-xs">
                    <span className="text-blue-400 font-mono uppercase">{r.type}</span>
                    <span className="text-white font-semibold font-mono">
                      {r.type === "timing" ? `${(r.diffMs / 1000).toFixed(3)}초` : `${r.diffMs}ms`}
                    </span>
                    <span className="text-amber-400 font-bold">상위 {r.percentile}%</span>
                    <span className="text-slate-500">{new Date(r.recordedAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AdSense Placement */}
        <AdSlot slotId="practice-bottom-responsive" format="auto" />
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
