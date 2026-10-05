"use client";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { TrendingPanels } from "@/components/live/TrendingPanels";
import { LiveChatRoom } from "@/components/live/LiveChatRoom";
import { AdSlot } from "@/components/common/AdSlot";
import { Radio, Users } from "lucide-react";

export default function LiveHubPage() {
  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Radio className="h-6 w-6 text-emerald-400" />
              <span>실시간 현황 & 오픈 대기실</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              지금 대한민국 전역의 티켓팅/오픈 트래픽과 사용자들의 실시간 소통 현황을 한눈에 확인하세요.
            </p>
          </div>
        </div>

        {/* 3 Column Trending Panels */}
        <section>
          <TrendingPanels />
        </section>

        {/* Middle AdSense Placement */}
        <AdSlot slotId="live-middle-responsive" format="auto" />

        {/* Global Live Chat Room */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">전체 오픈 통합 대기실</h2>
          <LiveChatRoom roomSlug="global-live" title="전체 오픈 통합 대기실" />
        </section>

        {/* Bottom AdSense Placement */}
        <AdSlot slotId="live-bottom-leaderboard" format="leaderboard" />
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
