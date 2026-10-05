"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { getGuestStorage } from "@/lib/storage/guest-storage";
import { Trophy, CheckCircle, ArrowLeft, Heart } from "lucide-react";
import { getApiUrl } from "@/lib/utils";

interface SuccessProof {
  id: string;
  authorNickname: string;
  eventName: string;
  seatInfo: string;
  serverUsed: string;
  recordedAt: number;
  likes: number;
}

export default function SuccessProofPage() {
  const [proofs, setProofs] = useState<SuccessProof[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [eventName, setEventName] = useState("");
  const [seatInfo, setSeatInfo] = useState("");
  const [serverUsed, setServerUsed] = useState("인터파크 티켓");
  const [nickname, setNickname] = useState("익명게스트");

  useEffect(() => {
    const st = getGuestStorage();
    if (st.guestProfile.nickname) {
      setNickname(st.guestProfile.nickname);
    }

    // Fetch shared success proofs from Edge Worker / Supabase
    fetch(getApiUrl("/api/community/success"))
      .then((r) => r.json())
      .then((d) => {
        if (d.proofs && Array.isArray(d.proofs)) {
          setProofs(d.proofs);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !seatInfo.trim()) return;

    try {
      const edgeBase = process.env.NEXT_PUBLIC_EDGE_API_URL;
      const targetUrl = edgeBase ? `${edgeBase.replace(/\/+$/, "")}/api/community/success` : "/api/community/success";

      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: eventName.trim(),
          seatInfo: seatInfo.trim(),
          serverUsed,
          authorNickname: nickname,
        }),
      });
      const data = await res.json();
      if (data.proof) {
        setProofs((prev) => [data.proof, ...prev]);
      }
    } catch {}

    setEventName("");
    setSeatInfo("");
    setShowModal(false);
  };

  const handleLike = (id: string) => {
    const updated = proofs.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p));
    setProofs(updated);
    try {
      localStorage.setItem("servertime_success_proofs", JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <Link href="/community" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-2">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>커뮤니티로 돌아가기</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-400" />
              <span>티켓팅 성공 인증 명예의 전당</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              SERVERTIME 정밀 서버시간으로 예매에 성공한 분들의 익명 인증 공간입니다.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 text-xs shadow-lg shadow-amber-500/20"
          >
            내 성공 인증 등록
          </button>
        </div>

        {/* Proof List */}
        {proofs.length === 0 ? (
          <div className="w-full rounded-2xl border border-dashed border-slate-800 bg-[#0C101A] p-12 text-center">
            <p className="text-sm font-medium text-slate-400">아직 등록된 성공 인증이 없습니다.</p>
            <p className="text-xs text-slate-500 mt-1">티켓팅에 성공하셨다면 첫 번째 주인공이 되어보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {proofs.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl premium-card p-5 space-y-3 border-amber-500/20 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">{p.authorNickname}</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                    {p.serverUsed}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white">{p.eventName}</h3>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5 font-bold">좌석: {p.seatInfo}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(p.recordedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleLike(p.id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    <span>축하 {p.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl premium-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">성공 인증 등록</h3>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">공연/행사명</label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="예: 2026 월드투어 서울 콘서트"
                    maxLength={50}
                    className="w-full rounded-xl border border-slate-700 bg-[#0E1321] p-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">예매 성공 좌석</label>
                  <input
                    type="text"
                    value={seatInfo}
                    onChange={(e) => setSeatInfo(e.target.value)}
                    placeholder="예: VIP 플로어 A구역 12열"
                    maxLength={50}
                    className="w-full rounded-xl border border-slate-700 bg-[#0E1321] p-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">이용한 서버시간</label>
                  <select
                    value={serverUsed}
                    onChange={(e) => setServerUsed(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-[#0E1321] p-2.5 text-white"
                  >
                    <option value="인터파크 티켓">인터파크 티켓</option>
                    <option value="예스24 티켓">예스24 티켓</option>
                    <option value="멜론티켓">멜론티켓</option>
                    <option value="티켓링크">티켓링크</option>
                    <option value="네이버 예약">네이버 예약</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:text-white"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 font-black text-slate-950 px-5 py-2 hover:bg-amber-400"
                  >
                    인증 완료
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
