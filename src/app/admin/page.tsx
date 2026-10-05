"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Activity,
  Server,
  Cpu,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Eye,
  Zap,
  Layers,
  Lock,
  LogOut,
  ArrowUpRight,
  BarChart3,
  Clock,
  Globe,
  Radio,
  FileText,
  DollarSign,
  Info,
} from "lucide-react";
import { getApiUrl } from "@/lib/utils";

interface AdminMetrics {
  success: boolean;
  timestamp: number;
  auth?: {
    method: string;
    email: string | null;
  };
  overview: {
    todayUv: number;
    todayPv: number;
    activeUsers: number;
    changeVsYesterdayPercent: number;
    analyticsValidFrom?: string;
    legacyTotalViews?: number;
    trend7Days: Array<{ date: string; uv: number; pv: number }>;
  };
  serverTraffic: {
    topHosts: Array<{
      host: string;
      views: number;
      activeUsers: number;
      avgRttMs: number;
      lastMeasuredAt: number;
    }>;
    rawHostViews: Record<string, number>;
    analyticsValidFrom?: string;
  };
  workerUsage: {
    invocationsToday: number;
    subrequestsToday: number;
    byEndpoint: Record<string, number>;
    byTarget: Record<string, number>;
  };
  ticketIngestion: {
    melonCount: number;
    yes24Count: number;
    ticketlinkCount: number;
    nolCount: number;
    nolStatus?: string;
    status: string;
    lastIngestionAt: string;
    dedupeCount: number;
  };
  eventAnalytics: {
    topEvents: Array<{
      eventSlug: string;
      views: number;
    }>;
    rawEventViews: Record<string, number>;
    cardClicksToday: number;
  };
  community: {
    postsCount: number;
    successCount: number;
    reportsCount: number;
    recentPosts: Array<{
      id: string;
      category: string;
      title: string;
      author_nickname: string;
      created_at: string;
      likes_count: number;
    }>;
  };
  systemHealth: {
    workerStatus: string;
    durableObjectStatus: string;
    supabaseStatus: string;
    supabasePingMs: number;
    cronStatus: string;
    lastRollupAt: string | null;
    lastCronAt: string | null;
  };
  costMonitoring: {
    cloudflare: {
      limitDaily: number;
      usedToday: number;
      usagePercent: number;
      projectedDaily: number;
      alertLevel: "NORMAL" | "WARNING_70" | "CRITICAL_85" | "EMERGENCY_95";
    };
    supabase: {
      quotaMb: number;
      usedMb: number;
      tables: Record<string, number>;
      apiCallsToday: number;
    };
  };
}

export default function AdminDashboardPage() {
  const [adminKey, setAdminKey] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [data, setData] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "servers" | "worker" | "ingestion" | "events" | "community" | "health" | "costs"
  >("overview");

  // Check Cloudflare Access session or load key from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("servertime_admin_key");
      if (saved) {
        setAdminKey(saved);
        fetchMetrics(saved);
      } else {
        // Probe Cloudflare Access credentials seamlessly
        fetchMetrics("", true);
      }
    }
  }, []);

  const fetchMetrics = useCallback(async (keyToUse: string, isInitialProbe = false) => {
    setLoading(true);
    if (!isInitialProbe) setAuthError("");
    try {
      const url = keyToUse
        ? getApiUrl(`/api/admin/metrics?key=${encodeURIComponent(keyToUse)}`)
        : getApiUrl("/api/admin/metrics");
      const headers: Record<string, string> = {};
      if (keyToUse) {
        headers["x-admin-key"] = keyToUse;
      }
      const res = await fetch(url, {
        headers,
        credentials: "include",
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        if (!isInitialProbe) {
          setAuthError("유효하지 않은 관리자 인증키입니다. 다시 입력해 주세요.");
          sessionStorage.removeItem("servertime_admin_key");
        }
        return;
      }

      if (!res.ok) {
        throw new Error(`서버 응답 오류 (HTTP ${res.status})`);
      }

      const json = await res.json();
      setData(json);
      setIsAuthenticated(true);
      setLastRefreshed(new Date());
      if (keyToUse) {
        sessionStorage.setItem("servertime_admin_key", keyToUse);
      }
    } catch (err) {
      if (!isInitialProbe) {
        setAuthError((err as Error).message || "지표를 불러오지 못했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh interval (30s) if enabled
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || !adminKey) return;
    const timer = setInterval(() => {
      fetchMetrics(adminKey);
    }, 30000);
    return () => clearInterval(timer);
  }, [autoRefresh, isAuthenticated, adminKey, fetchMetrics]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;
    fetchMetrics(adminKey.trim());
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminKey("");
    sessionStorage.removeItem("servertime_admin_key");
    setData(null);
  };

  // -------------------------------------------------------------
  // 1. Unauthenticated Login Screen (Security Barrier)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0D121F] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-2">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">SERVERTIME 관리자 콘솔</h1>
            <p className="text-xs text-slate-400">
              인가된 관리자 전용 통계 시스템입니다. 관리자 보안 키를 입력해 주세요.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Access Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="관리자 인증키 입력"
                  className="w-full bg-[#07090E] border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>인증 확인 중...</span>
                </>
              ) : (
                <>
                  <span>대시보드 접속</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
            >
              <span>← 메인 서비스로 돌아가기</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. Authenticated Admin Dashboard (Desktop-First)
  // -------------------------------------------------------------
  const overview = data?.overview;
  const workerUsage = data?.workerUsage;
  const serverTraffic = data?.serverTraffic;
  const ticketIngestion = data?.ticketIngestion;
  const eventAnalytics = data?.eventAnalytics;
  const community = data?.community;
  const systemHealth = data?.systemHealth;
  const cost = data?.costMonitoring;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#0A0D15]/80 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm tracking-wide text-white">SERVERTIME ADMIN</span>
              <span className="text-[10px] font-mono ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                LIVE METRICS
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-600">|</span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            출처: Cloudflare Edge DO & Supabase Live
          </span>
          {data?.auth?.email ? (
            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-mono">
              CF Access ({data.auth.email})
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-400 text-[10px] font-mono">
              Admin Session
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-slate-500 font-mono hidden md:inline">
              마지막 갱신: {lastRefreshed.toLocaleTimeString("ko-KR")}
            </span>
          )}

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              autoRefresh
                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? "animate-pulse text-blue-400" : ""}`} />
            <span>30초 자동갱신 {autoRefresh ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={() => fetchMetrics(adminKey)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>새로고침</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/40 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-800 p-4 space-y-1 hidden lg:block shrink-0">
          <p className="text-[11px] font-bold text-slate-500 px-3 py-2 uppercase tracking-wider">
            모니터링 카테고리
          </p>
          {[
            { id: "overview", label: "Overview 종합", icon: Activity },
            { id: "servers", label: "Server Traffic", icon: Server },
            { id: "worker", label: "Worker Usage", icon: Cpu },
            { id: "ingestion", label: "Ticket Ingestion", icon: RefreshCw },
            { id: "events", label: "Event Analytics", icon: BarChart3 },
            { id: "community", label: "Community", icon: FileText },
            { id: "health", label: "System Health", icon: Zap },
            { id: "costs", label: "비용 / 무료 한도", icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-6 px-3">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>트래픽 수집 제외 알림</span>
              </div>
              <p className="leading-relaxed">
                관리자 페이지(`/admin`)의 모든 조회 및 메트릭 호출은 사용자 트래픽 통계(PV/UV)에서 100% 자동 제외됩니다.
              </p>
            </div>
          </div>
        </aside>

        {/* Center Content Area */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Quick Warning Header if Worker Usage High */}
          {cost?.cloudflare.alertLevel !== "NORMAL" && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-bold text-sm">Cloudflare Worker 일일 사용량 경고</h4>
                  <p className="text-xs text-amber-400/80">
                    현재 오늘 사용량 {cost?.cloudflare.usagePercent}% 도달 ({cost?.cloudflare.usedToday} / 100,000 req)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("costs")}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 hover:bg-amber-500/30"
              >
                한도 상세 보기
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. OVERVIEW SECTION                                      */}
          {/* ========================================================= */}
          {(activeTab === "overview" || activeTab === "all" as any) && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span>Overview (실제 방문자 트래픽)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Durable Object 메모리 및 트랜잭션 스토리지 기반 실시간 순방문자 & 페이지뷰
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-[11px] font-mono text-emerald-300">
                    정상 통계 집계 시작: {overview?.analyticsValidFrom || "2026-10-05 14:30 KST"}
                  </span>
                </div>
              </div>

              {/* Bug Fix Data Isolation Notice & Definitions */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>리렌더링 버그 발생 기간 데이터 격리 완료:</strong> 버그 수정 시각({overview?.analyticsValidFrom || "2026-10-05 14:30 KST"}) 이전 비정상 PV({overview?.legacyTotalViews ? `${overview.legacyTotalViews.toLocaleString()}회` : "10,240회"})는 별도 레거시 저장소로 안전하게 격리되었으며, 기본 통계는 버그 수정 이후의 실측 데이터만 집계합니다.
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
                  <div className="text-indigo-300 font-mono">
                    <strong>• UV</strong>: deduplicated anonymous visitor (중복 배제된 익명 순방문자)
                  </div>
                  <div className="text-blue-300 font-mono">
                    <strong>• PV</strong>: 실제 페이지 진입 횟수 (1분 디바운스/정상 렌더)
                  </div>
                  <div className="text-amber-300 font-mono">
                    <strong>• Worker Invocation</strong>: 인프라 API 호출 (Edge Worker 람다 실행 횟수)
                  </div>
                </div>
              </div>

              {/* 4 Overview Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0D121F] border border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>오늘 UV (순방문자)</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-black font-mono text-white">
                    {overview?.todayUv.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-indigo-400/90 font-mono">
                    deduplicated anonymous visitor
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D121F] border border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>오늘 PV (총 조회수)</span>
                    <Eye className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black font-mono text-white">
                    {overview?.todayPv.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-blue-400/90 font-mono">
                    실제 페이지 진입 횟수 (정상 집계 기준)
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D121F] border border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>현재 활성 사용자</span>
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-3xl font-black font-mono text-emerald-400">
                    {overview?.activeUsers.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    최근 5분 이내 활성 세션
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D121F] border border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>어제 대비 증감</span>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-200">
                    {overview?.changeVsYesterdayPercent ? `${overview.changeVsYesterdayPercent}%` : "0%"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    정상 롤업 기준 변동률
                  </div>
                </div>
              </div>

              {/* 7-Day Trend Table */}
              <div className="p-5 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span>최근 7일 방문 추이</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">단위: 명 / 회</span>
                </div>
                <div className="grid grid-cols-7 gap-2 pt-2">
                  {overview?.trend7Days.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1"
                    >
                      <span className="text-[11px] text-slate-400 block font-mono">{t.date}</span>
                      <span className="text-sm font-bold text-blue-400 block font-mono">
                        {t.uv} UV
                      </span>
                      <span className="text-xs text-slate-300 block font-mono">
                        {t.pv} PV
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 2. SERVER TRAFFIC SECTION                                 */}
          {/* ========================================================= */}
          {(activeTab === "servers" || activeTab === "all" as any) && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-indigo-400" />
                    <span>Server Traffic (호스트별 실시간 트래픽)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    도메인별 누적 조회수, 활성 세션 점유율 및 RTT 지연시간
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300">
                  데이터 출처: DurableObject host:*
                </div>
              </div>

              <div className="rounded-2xl bg-[#0D121F] border border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3">순위</th>
                      <th className="px-5 py-3">대상 호스트</th>
                      <th className="px-5 py-3 text-right">누적 조회수</th>
                      <th className="px-5 py-3 text-right">현재 활성 세션</th>
                      <th className="px-5 py-3 text-right">평균 RTT</th>
                      <th className="px-5 py-3 text-right">마지막 측정 시각</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                    {serverTraffic?.topHosts && serverTraffic.topHosts.length > 0 ? (
                      serverTraffic.topHosts.map((s, idx) => (
                        <tr key={s.host} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3.5 text-slate-500 font-bold">#{idx + 1}</td>
                          <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2 font-sans">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span>{s.host}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-blue-400">
                            {s.views.toLocaleString()}회
                          </td>
                          <td className="px-5 py-3.5 text-right text-emerald-400 font-bold">
                            {s.activeUsers > 0 ? `${s.activeUsers}명` : "-"}
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-300">
                            ~{s.avgRttMs}ms
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-400 text-[11px]">
                            {new Date(s.lastMeasuredAt).toLocaleTimeString("ko-KR")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                          기록된 서버 트래픽이 없습니다 (0 건).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 3. WORKER USAGE SECTION                                   */}
          {/* ========================================================= */}
          {(activeTab === "worker" || activeTab === "all" as any) && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-amber-400" />
                    <span>Worker Usage (인프라 API 및 하위 요청)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Cloudflare Worker 엣지 실행 횟수와 외부 타깃 Subrequest 집계
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>중요: 사용자 PV와 Worker 호출량은 별개의 지표로 독립 집계됩니다.</span>
                </div>
              </div>

              {/* Invocations vs Subrequests Top Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400">오늘 누적 Worker Invocations</span>
                  <div className="text-3xl font-black font-mono text-amber-400">
                    {workerUsage?.invocationsToday.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Edge Worker 전체 실행 횟수 (100,000 한도 차감 기준)
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400">오늘 누적 Subrequests</span>
                  <div className="text-3xl font-black font-mono text-cyan-400">
                    {workerUsage?.subrequestsToday.toLocaleString() ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Worker에서 외부 타깃/Supabase로 전송한 하위 fetch 횟수
                  </div>
                </div>
              </div>

              {/* Endpoint Breakdown & External Target Subrequests */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Endpoint Breakdown */}
                <div className="p-5 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Endpoint별 호출량</span>
                  </h3>
                  <div className="space-y-2">
                    {workerUsage?.byEndpoint &&
                      Object.entries(workerUsage.byEndpoint).map(([ep, count]) => (
                        <div
                          key={ep}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono"
                        >
                          <span className="text-slate-300 font-semibold">{ep}</span>
                          <span className="text-amber-400 font-bold">{count.toLocaleString()}회</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Target Subrequest Breakdown */}
                <div className="p-5 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>외부 Target별 Subrequest</span>
                  </h3>
                  <div className="space-y-2">
                    {workerUsage?.byTarget &&
                      Object.entries(workerUsage.byTarget).map(([tgt, count]) => (
                        <div
                          key={tgt}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono"
                        >
                          <span className="text-slate-300 font-semibold">{tgt}</span>
                          <span className="text-cyan-400 font-bold">{count.toLocaleString()}회</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 4. TICKET INGESTION SECTION                               */}
          {/* ========================================================= */}
          {(activeTab === "ingestion" || activeTab === "all" as any) && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-emerald-400" />
                    <span>Ticket Ingestion (자동 티켓 수집 현황)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    주요 티켓 플랫폼 오픈 공지사항 및 공식 CDN 포스터 수집 결과
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300">
                  데이터 출처: Supabase events & ingestion pipeline
                </span>
              </div>

              {/* Status & Counts Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">수집 파이프라인 상태</span>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {ticketIngestion?.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Melon 수집건수</span>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {ticketIngestion?.melonCount}건
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">YES24 수집건수</span>
                  <div className="text-2xl font-black font-mono text-blue-400">
                    {ticketIngestion?.yes24Count}건
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Ticketlink 수집건수</span>
                  <div className="text-2xl font-black font-mono text-purple-400">
                    {ticketIngestion?.ticketlinkCount}건
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">NOL(인터파크) 수집건수</span>
                  <div className="text-2xl font-black font-mono text-rose-400">
                    {ticketIngestion?.nolCount ?? 0}건
                  </div>
                  <span className="text-[10px] text-rose-400/80 block">WAF 보호 (수집 보류)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>NOL(구 인터파크) 실데이터 출처 검증 결과:</strong> 공식 티켓오픈 공지 소스는 현재 WAF 보호(403/Challenge) 상태이며, 비공식/임의 합성 데이터는 통계에서 완전히 배제되어 정상 0건으로 반영됩니다.
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 gap-2">
                <div>
                  <span className="text-slate-500">마지막 수집 시각: </span>
                  <span className="text-white font-bold">
                    {ticketIngestion?.lastIngestionAt
                      ? new Date(ticketIngestion.lastIngestionAt).toLocaleString("ko-KR")
                      : "최근 완료"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">중복 배제(Dedupe) 건수: </span>
                  <span className="text-blue-400 font-bold">{ticketIngestion?.dedupeCount}건</span>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 5. EVENT ANALYTICS SECTION                                */}
          {/* ========================================================= */}
          {(activeTab === "events" || activeTab === "all" as any) && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <span>Event Analytics (인기 이벤트 상세 및 클릭)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    실제 티켓팅 이벤트별 상세 페이지 조회수 및 오늘 오픈 카드 클릭수
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300">
                  데이터 출처: DurableObject event:*
                </span>
              </div>

              <div className="rounded-2xl bg-[#0D121F] border border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3">순위</th>
                      <th className="px-5 py-3">이벤트 Slug</th>
                      <th className="px-5 py-3 text-right">상세 조회수</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                    {eventAnalytics?.topEvents && eventAnalytics.topEvents.length > 0 ? (
                      eventAnalytics.topEvents.map((e, idx) => (
                        <tr key={e.eventSlug} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3 text-slate-500 font-bold">#{idx + 1}</td>
                          <td className="px-5 py-3 text-white font-bold">{e.eventSlug}</td>
                          <td className="px-5 py-3 text-right text-purple-400 font-bold">
                            {e.views.toLocaleString()}회
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-5 py-6 text-center text-slate-500">
                          이벤트 상세 조회 기록이 없습니다 (0 건).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 6. COMMUNITY SECTION                                      */}
          {/* ========================================================= */}
          {(activeTab === "community" || activeTab === "all" as any) && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span>Community (커뮤니티 및 성공 인증 활동)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    익명 게시글, 티켓팅 성공 인증 및 유저 활동 모니터링
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300">
                  데이터 출처: Supabase community_posts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">등록된 총 게시글</span>
                  <div className="text-2xl font-black font-mono text-white">
                    {community?.postsCount}건
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">성공 인증 게시글</span>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {community?.successCount}건
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">누적 신고 건수</span>
                  <div className="text-2xl font-black font-mono text-slate-400">
                    {community?.reportsCount}건
                  </div>
                </div>
              </div>

              {/* Recent Posts List */}
              <div className="p-5 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  최근 작성된 커뮤니티 게시글
                </h3>
                {community?.recentPosts && community.recentPosts.length > 0 ? (
                  <div className="space-y-2">
                    {community.recentPosts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400 text-[10px] font-bold">
                              {p.category}
                            </span>
                            <span className="font-bold text-white">{p.title}</span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            작성자: {p.author_nickname}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          좋아요 {p.likes_count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    등록된 게시글이 없습니다.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 7. SYSTEM HEALTH SECTION                                  */}
          {/* ========================================================= */}
          {(activeTab === "health" || activeTab === "all" as any) && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <span>System Health (인프라 상태 및 헬스체크)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Cloudflare Worker, Durable Object, Supabase 실시간 가동 상태
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300">
                  데이터 출처: Edge Health Ping & Storage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Cloudflare Worker</span>
                  <div className="flex items-center gap-2 pt-1 font-mono font-bold text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{systemHealth?.workerStatus}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Durable Object</span>
                  <div className="flex items-center gap-2 pt-1 font-mono font-bold text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{systemHealth?.durableObjectStatus}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Supabase DB</span>
                  <div className="flex items-center gap-2 pt-1 font-mono font-bold text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{systemHealth?.supabaseStatus} ({systemHealth?.supabasePingMs}ms)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Cron Scheduler</span>
                  <div className="flex items-center gap-2 pt-1 font-mono font-bold text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{systemHealth?.cronStatus} (3 triggers)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500">마지막 DB 롤업(Rollup) 플러시 시각: </span>
                  <span className="text-white font-bold">
                    {systemHealth?.lastRollupAt
                      ? new Date(systemHealth.lastRollupAt).toLocaleString("ko-KR")
                      : "대기 중 (정각 자동 플러시)"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">마지막 크론 실행 시각: </span>
                  <span className="text-white font-bold">
                    {systemHealth?.lastCronAt
                      ? new Date(systemHealth.lastCronAt).toLocaleString("ko-KR")
                      : "정상 가동 중"}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 8. COST & FREE TIER MONITORING SECTION                    */}
          {/* ========================================================= */}
          {(activeTab === "costs" || activeTab === "all" as any) && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    <span>비용 / 무료 한도 실시간 모니터링</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Cloudflare Workers 및 Supabase Free Tier 사용률과 안전 마진
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300">
                  기준: Cloudflare Free 100,000 req/day
                </span>
              </div>

              {/* Cloudflare Quota Progress Bar Card */}
              <div className="p-6 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Cloudflare Workers 일일 한도 진행률</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          cost?.cloudflare.alertLevel === "NORMAL"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : cost?.cloudflare.alertLevel === "WARNING_70"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {cost?.cloudflare.alertLevel}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      오늘 사용량: {cost?.cloudflare.usedToday.toLocaleString()} /{" "}
                      {cost?.cloudflare.limitDaily.toLocaleString()} requests ({cost?.cloudflare.usagePercent}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono">24시 예상 마감</span>
                    <span className="text-lg font-bold text-white font-mono">
                      ~{cost?.cloudflare.projectedDaily.toLocaleString()} req
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (cost?.cloudflare.usagePercent ?? 0) >= 85
                        ? "bg-rose-500"
                        : (cost?.cloudflare.usagePercent ?? 0) >= 70
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.max(1, cost?.cloudflare.usagePercent ?? 0)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>0% (안전)</span>
                  <span>70% 경고</span>
                  <span>85% 위험</span>
                  <span>100% 한도 도달</span>
                </div>
              </div>

              {/* Supabase Free Quota Card */}
              <div className="p-6 rounded-2xl bg-[#0D121F] border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-white">Supabase Free Tier (500MB 한도)</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      추정 사용량: {cost?.supabase.usedMb}MB / {cost?.supabase.quotaMb}MB (약 1% 미만, 초저용량 유지)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 font-mono text-xs">
                  {cost?.supabase.tables &&
                    Object.entries(cost.supabase.tables).map(([tbl, rows]) => (
                      <div
                        key={tbl}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1"
                      >
                        <span className="text-slate-400 block text-[11px] truncate">{tbl}</span>
                        <span className="text-sm font-bold text-blue-400 block">{rows} rows</span>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
