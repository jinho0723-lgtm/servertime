"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { resolveTargetHostname } from "@/lib/domain-resolver";

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
}

export function SearchBar({
  initialValue = "",
  placeholder = "사이트 주소를 입력하세요 (예: ticket.interpark.com)",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Smartly resolve Korean keywords e.g. "인터파크", "놀티켓" -> canonical slug "nol-ticket"
    const resolved = resolveTargetHostname(query);
    router.push(`/server/${encodeURIComponent(resolved.canonicalSlug)}`);
  };

  const popularQuickSites = [
    { label: "NOL 티켓(구 인터파크)", fullName: "인터파크 티켓(NOL) 서버시간", slug: "nol-ticket" },
    { label: "YES24", fullName: "YES24 티켓 서버시간", slug: "yes24" },
    { label: "티켓링크", fullName: "티켓링크 서버시간", slug: "ticketlink" },
    { label: "멜론티켓", fullName: "멜론티켓 서버시간", slug: "melon" },
    { label: "네이버", fullName: "네이버 예약 서버시간", slug: "naver" },
    { label: "서울대", fullName: "서울대학교 수강신청 서버시간", slug: "snu" },
    { label: "고려대", fullName: "고려대학교 수강신청 서버시간", slug: "korea" },
    { label: "연세대", fullName: "연세대학교 수강신청 서버시간", slug: "yonsei" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-300 dark:border-[#27334D] bg-white dark:bg-[#0E131F]/90 px-4 py-3.5 pr-12 text-sm text-slate-900 dark:text-white shadow-sm dark:shadow-2xl backdrop-blur-md transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          type="submit"
          className="absolute right-1.5 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/30 transition-transform active:scale-95 hover:bg-blue-500"
          aria-label="서버시간 조회"
        >
          <Search className="h-4 w-4 text-white" />
        </button>
      </form>

      {/* Popular quick links matching design_reference.png (Semantic anchor links for SEO) */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-500 dark:text-slate-400 mr-1 font-medium">인기 서버</span>
        {popularQuickSites.map((site) => (
          <Link
            key={site.slug}
            href={`/server/${site.slug}`}
            prefetch={false}
            title={`${site.fullName} 확인하기`}
            className="rounded-md border border-slate-200 dark:border-[#20293D] bg-slate-100/90 dark:bg-[#0F1422] px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium transition-colors hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-white shadow-sm dark:shadow-none inline-flex items-center"
          >
            {site.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
