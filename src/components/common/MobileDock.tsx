"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Calendar, Trophy, Radio, Settings } from "lucide-react";
import { useState } from "react";
import { getGuestStorage, saveGuestStorage } from "@/lib/storage/guest-storage";

export function MobileDock() {
  const pathname = usePathname();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const tabs = [
    { label: "시간", href: "/server", icon: Clock },
    { label: "오늘", href: "/open/today", icon: Calendar },
    { label: "연습", href: "/practice", icon: Trophy },
    { label: "LIVE", href: "/live", icon: Radio },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[#1E2536] bg-[#0A0D15]/95 px-2 backdrop-blur-lg md:hidden">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 ${
                isActive ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-medium mt-1">{tab.label}</span>
            </Link>
          );
        })}

        {/* Settings button */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex flex-col items-center justify-center py-1 px-3 text-slate-400 hover:text-slate-200"
        >
          <Settings className="h-5 w-5" />
          <span className="text-[11px] font-medium mt-1">설정</span>
        </button>
      </nav>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#212A3D] bg-[#0F1420] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">게스트 사용자 환경설정</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-300">
              <div>
                <label className="text-xs text-slate-400">내 익명 닉네임</label>
                <input
                  type="text"
                  defaultValue={getGuestStorage().guestProfile.nickname}
                  onBlur={(e) => {
                    const st = getGuestStorage();
                    st.guestProfile.nickname = e.target.value.trim();
                    saveGuestStorage(st);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-[#090C14] px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="rounded-lg bg-blue-950/30 border border-blue-900/40 p-3 text-xs text-blue-300">
                💡 SERVERTIME은 회원가입 없이 브라우저 저장소(localStorage)로 모든 설정을 기억합니다.
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
