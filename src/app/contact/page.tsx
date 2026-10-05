"use client";

import { useState } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { SITE_CONFIG } from "@/lib/site-config";
import { Mail, MessageSquare, Copy, Check, Send, Sparkles, HelpCircle } from "lucide-react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("ad");
  const [message, setMessage] = useState("");

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(SITE_CONFIG.contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMailtoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catLabel =
      category === "ad"
        ? "[제휴/광고]"
        : category === "server"
        ? "[서버 추가 요청]"
        : category === "bug"
        ? "[오류 제보]"
        : "[일반 문의]";

    const fullSubject = encodeURIComponent(`[SERVERTIME] ${catLabel} ${subject || "문의드립니다"}`);
    const fullBody = encodeURIComponent(message);
    window.location.href = `mailto:${SITE_CONFIG.contactEmail}?subject=${fullSubject}&body=${fullBody}`;
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Page Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-300">
            <Mail className="h-3.5 w-3.5" />
            <span>CONTACT & PARTNERSHIP</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            제휴 및 문의하기
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            SERVERTIME과의 배너 광고 제휴, 새로운 서버 등록 요청, 서비스 개선 피드백을 환영합니다.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-blue-300 font-bold text-base">
              <Mail className="h-5 w-5" />
              <span>공식 문의 이메일</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              제휴, 광고 게재 문의 및 일반 건의사항은 아래 이메일로 보내주시면 담당자가 영업일 기준 24~48시간 이내에 회신드립니다.
            </p>
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#090C16] p-3">
              <span className="font-mono text-sm font-bold text-white select-all">
                {SITE_CONFIG.contactEmail}
              </span>
              <button
                onClick={handleCopyEmail}
                className="flex items-center gap-1 rounded-lg bg-blue-600/30 border border-blue-500/40 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/50 transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "복사됨!" : "주소 복사"}</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#090C16] p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-slate-200 font-bold text-base">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>주요 문의 분야</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">· 광고 제휴:</span>
                <span>상단 리더보드, 인라인 배너, 스폰서십 제휴</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">· 서버 추가:</span>
                <span>특정 대학교 수강신청, 예매 사이트, 커머스 서버 등록 요청</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">· 기능 건의:</span>
                <span>티켓팅 연습 센터 기능 추가 및 시계 표시 개선 의견</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Email Form */}
        <section className="rounded-3xl premium-card p-6 sm:p-8 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              <span>간편 이메일 작성</span>
            </h2>
            <p className="text-xs text-slate-400">
              내용을 작성하고 전송 버튼을 누르면 기본 메일 프로그램으로 연결됩니다.
            </p>
          </div>

          <form onSubmit={handleMailtoSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                문의 유형
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "ad", label: "제휴 및 광고" },
                  { id: "server", label: "서버 추가 요청" },
                  { id: "bug", label: "오류 및 버그 제보" },
                  { id: "general", label: "기타 일반 문의" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`rounded-xl border py-2 text-xs font-semibold transition ${
                      category === item.id
                        ? "border-blue-500 bg-blue-600/20 text-blue-300"
                        : "border-slate-800 bg-[#090C16] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                제목
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="문의 제목을 입력하세요"
                className="w-full rounded-xl border border-slate-700 bg-[#090C14] px-4 py-2.5 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                문의 내용
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="구체적인 문의 내용이나 제안을 입력해 주세요."
                className="w-full rounded-xl border border-slate-700 bg-[#090C14] px-4 py-2.5 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
            >
              <Send className="h-4 w-4" />
              <span>메일 프로그램으로 전송하기</span>
            </button>
          </form>
        </section>
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
