import Link from "next/link";
import { ShieldCheck, Mail, Clock, ExternalLink } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-[#1A2234] bg-slate-100/80 dark:bg-[#07090E] py-12 text-slate-600 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white tracking-wider">SERVERTIME</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              티켓팅 · 수강신청 · 예약 · 한정판매 오픈을 위한 정밀 서버시간 및 오픈 타이밍 정보 플랫폼.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>100% 완전 비회원제 보증</span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <Link href="/about" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">서비스 소개</Link>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <Link href="/accuracy" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">기술 안내</Link>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <Link href="/guide" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">가이드</Link>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <Link href="/privacy" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">개인정보처리방침</Link>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <Link href="/terms" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">이용약관</Link>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-300">인기 서버시간</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/server/nol-ticket" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">NOL 티켓 (구 인터파크) 서버시간</Link></li>
              <li><Link href="/server/yes24" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">예스24 티켓 서버시간</Link></li>
              <li><Link href="/server/ticketlink" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">티켓링크 서버시간</Link></li>
              <li><Link href="/server/melon" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">멜론티켓 서버시간</Link></li>
              <li><Link href="/server/naver-booking" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">네이버 예약 서버시간</Link></li>
            </ul>
          </div>

          {/* Tools & Practice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-300">도구 및 트레이닝</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/practice" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">티켓팅 연습 센터</Link></li>
              <li><Link href="/practice?tab=timing" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">정각 00초 클릭 훈련</Link></li>
              <li><Link href="/practice?tab=seat" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">포도알 좌석 선택 훈련</Link></li>
              <li><Link href="/tools/countdown" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">밀리초 정밀 타이머</Link></li>
              <li><Link href="/tools/world-clock" prefetch={false} className="hover:text-blue-600 dark:hover:text-blue-400">세계 표준시 비교</Link></li>
            </ul>
          </div>

          {/* Precision & Policy + Partnership / Ad Contact */}
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-300">정밀도 공지 및 유의사항</h4>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                SERVERTIME의 서버시간은 HTTP Date 응답과 왕복 RTT 보정, performance.now() 보간을 통해 추정된 시각입니다.
              </p>
            </div>

            {/* Partnership & Ad Inquiry Box */}
            <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/70 dark:bg-[#0C1222] p-3.5 space-y-1.5 shadow-sm dark:shadow-md">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-semibold text-xs">
                <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>제휴 및 광고 문의</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                배너 광고 및 비즈니스 제휴 문의는 아래 메일로 연락 부탁드립니다.
              </p>
              <div className="flex items-center gap-3 pt-0.5">
                <a
                  href={`mailto:${SITE_CONFIG.contactEmail}?subject=[SERVERTIME] 제휴 및 광고 문의`}
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  title="제휴/광고 문의 메일 보내기"
                >
                  <span>{SITE_CONFIG.contactEmail}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Link
                  href="/contact"
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline"
                >
                  문의 안내 페이지
                </Link>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              © 2026 SERVERTIME. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
