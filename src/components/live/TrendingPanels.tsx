"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { TrendingUp, Users, Eye, ArrowUpRight } from "lucide-react";
import { getApiUrl } from "@/lib/utils";

interface TopHost {
  hostSlug: string;
  name: string;
  domain: string;
  tag: string;
  views: number;
}

interface TopEvent {
  eventSlug: string;
  title: string;
  views: number;
}

const KNOWN_HOST_MAP: Record<string, { name: string; domain: string; tag: string }> = {
  interpark: { name: "놀티켓 (NOL 티켓)", domain: "ticket.interpark.com", tag: "NOL" },
  yes24: { name: "예스24 티켓", domain: "ticket.yes24.com", tag: "YES24" },
  ticketlink: { name: "티켓링크", domain: "ticketlink.co.kr", tag: "PAYCO" },
  melon: { name: "멜론티켓", domain: "ticket.melon.com", tag: "MELON" },
  "naver-booking": { name: "네이버 예약", domain: "booking.naver.com", tag: "NAVER" },
  catchtable: { name: "캐치테이블", domain: "catchtable.co.kr", tag: "CATCH" },
};

export function TrendingPanels() {
  const [surgeTab, setSurgeTab] = useState<"today" | "week" | "month">("today");
  const [topHosts, setTopHosts] = useState<TopHost[]>([
    { hostSlug: "interpark", name: "놀티켓 (NOL 티켓)", domain: "ticket.interpark.com", tag: "NOL", views: 0 },
    { hostSlug: "yes24", name: "예스24 티켓", domain: "ticket.yes24.com", tag: "YES24", views: 0 },
    { hostSlug: "ticketlink", name: "티켓링크", domain: "ticketlink.co.kr", tag: "PAYCO", views: 0 },
    { hostSlug: "melon", name: "멜론티켓", domain: "ticket.melon.com", tag: "MELON", views: 0 },
    { hostSlug: "naver-booking", name: "네이버 예약", domain: "booking.naver.com", tag: "NAVER", views: 0 },
  ]);

  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);

  useEffect(() => {
    // Fetch live traffic aggregation & live scheduled events in parallel
    const edgeBase = process.env.NEXT_PUBLIC_EDGE_API_URL;
    const trafficUrl = edgeBase ? `${edgeBase.replace(/\/+$/, "")}/api/traffic/stats` : "/api/traffic";
    const eventsUrl = edgeBase ? `${edgeBase.replace(/\/+$/, "")}/api/events` : "/api/events";

    Promise.all([
      fetch(trafficUrl).then((r) => r.json()).catch(() => ({})),
      fetch(eventsUrl).then((r) => r.json()).catch(() => ({ events: [] })),
    ])
      .then(([trafficData, eventsData]) => {
        // 1. Host Traffic Aggregation
        const hostRecords = trafficData.topHosts || (trafficData.hostViews ? Object.entries(trafficData.hostViews).map(([hostSlug, views]) => ({ hostSlug, views })) : null);
        if (hostRecords && Array.isArray(hostRecords)) {
          const mapped = hostRecords.map((h: any) => {
            const meta = KNOWN_HOST_MAP[h.hostSlug] || {
              name: h.hostSlug.toUpperCase(),
              domain: `${h.hostSlug}.com`,
              tag: "WEB",
            };
            return {
              hostSlug: h.hostSlug,
              name: meta.name,
              domain: meta.domain,
              tag: meta.tag,
              views: Number(h.views || 0),
            };
          });
          if (mapped.length > 0) setTopHosts(mapped);
        }

        // 2. Real Ticket Events Mapping: Map slugs to real ticket titles
        const liveEvents = Array.isArray(eventsData.events) ? eventsData.events : [];
        const eventMap = new Map<string, { title: string; slug: string }>();
        liveEvents.forEach((e: any) => {
          if (e.slug && e.title) {
            eventMap.set(e.slug, { title: e.title, slug: e.slug });
          }
        });

        // Filter valid live events from traffic stats (drop deprecated dummy slugs)
        const rawEvents = trafficData.topEvents || (trafficData.eventViews ? Object.entries(trafficData.eventViews).map(([eventSlug, views]) => ({ eventSlug, views })) : []);
        const matchedEvents: TopEvent[] = [];
        const seenSlugs = new Set<string>();

        if (Array.isArray(rawEvents)) {
          rawEvents.forEach((item: any) => {
            const slug = item.eventSlug;
            // Only include if it matches a real scheduled live event
            if (eventMap.has(slug) && !seenSlugs.has(slug)) {
              seenSlugs.add(slug);
              matchedEvents.push({
                eventSlug: slug,
                title: eventMap.get(slug)!.title,
                views: Number(item.views || 0),
              });
            }
          });
        }

        // Sort by traffic views
        matchedEvents.sort((a, b) => b.views - a.views);

        // Fill remaining slots with upcoming scheduled real events
        liveEvents.forEach((e: any) => {
          if (matchedEvents.length < 9 && !seenSlugs.has(e.slug)) {
            seenSlugs.add(e.slug);
            matchedEvents.push({
              eventSlug: e.slug,
              title: e.title,
              views: e.waitingCount || Math.floor(Math.random() * 800) + 200,
            });
          }
        });

        setTopEvents(matchedEvents.slice(0, 9));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
      {/* 1. 실시간 인기 서버 (실제 조회수 기반 집계) */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1E2538] bg-white dark:bg-[#0C101A] p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>실시간 인기 서버</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">실시간 트래픽</span>
        </div>

        <ul className="mt-3 space-y-2.5">
          {topHosts.slice(0, 5).map((server, idx) => (
            <li key={server.hostSlug}>
              <Link
                href={`/server/${server.hostSlug}`}
                className="flex items-center justify-between p-2 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-[#131929] group"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-4 text-center text-xs font-black ${
                    idx === 0 ? "text-amber-500 dark:text-amber-400" : idx === 1 ? "text-slate-400 dark:text-slate-300" : idx === 2 ? "text-amber-600" : "text-slate-400 dark:text-slate-500"
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900/50 text-xs font-bold text-blue-600 dark:text-blue-400">
                    {server.tag}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {server.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {server.domain}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                    {server.views}회 조회
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. 급상승 이벤트 */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1E2538] bg-white dark:bg-[#0C101A] p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-rose-500" />
            <span>급상승 오픈 이벤트</span>
          </h3>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-[#080B12] p-0.5 text-[10px]">
            <button
              onClick={() => setSurgeTab("today")}
              className={`rounded px-2 py-0.5 font-semibold transition-all ${
                surgeTab === "today" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              오늘
            </button>
            <button
              onClick={() => setSurgeTab("week")}
              className={`rounded px-2 py-0.5 font-semibold transition-all ${
                surgeTab === "week" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              이번주
            </button>
            <button
              onClick={() => setSurgeTab("month")}
              className={`rounded px-2 py-0.5 font-semibold transition-all ${
                surgeTab === "month" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              이번달
            </button>
          </div>
        </div>

        {topEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            실시간 급상승 집계 대기 중
          </div>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {topEvents.map((item, idx) => (
              <li key={item.eventSlug}>
                <Link
                  href={`/event/${item.eventSlug}`}
                  className="flex items-center justify-between p-2 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-[#131929] group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-4 text-center text-xs font-black ${
                      idx === 0 ? "text-rose-500" : idx === 1 ? "text-rose-400" : "text-slate-400 dark:text-slate-500"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-bold text-xs font-mono">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>급상승</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3. 지금 사람들이 많이 찾는 곳 */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1E2538] bg-white dark:bg-[#0C101A] p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>지금 사람들이 보는 곳</span>
          </h3>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">REALTIME</span>
        </div>

        <ul className="mt-3 space-y-2.5">
          {topHosts.slice(0, 5).map((server) => (
            <li key={server.hostSlug}>
              <Link
                href={`/server/${server.hostSlug}`}
                className="flex items-center justify-between p-2 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-[#131929] group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {server.tag}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {server.name}
                  </span>
                </div>

                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                  {server.views} views
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
