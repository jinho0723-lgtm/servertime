import { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { SITE_CONFIG } from "@/lib/site-config";
import { Clock, ShieldCheck, Database, Cpu, Users, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "서비스 소개 | SERVERTIME",
  description: "SERVERTIME의 서비스 철학, 측정 원리, 100% 비회원제 정책 및 기술적 투명성을 소개합니다.",
  alternates: {
    canonical: `${SITE_CONFIG.canonicalBase}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Page Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-300">
            <span>ABOUT SERVERTIME</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            SERVERTIME 서비스 소개
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            SERVERTIME은 티켓팅, 수강신청, 예약, 한정 판매 등 정각 오픈 시각이 중요한 순간에 대상 웹서버의 기준 시각을 실시간으로 안내하는 무료 정보 도구입니다.
          </p>
        </div>

        {/* 1. Why SERVERTIME Exists */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-blue-400" />
            <span>왜 SERVERTIME을 만들었는가</span>
          </h2>
          <div className="rounded-2xl premium-card p-6 text-sm text-slate-300 space-y-4 leading-relaxed">
            <p>
              온라인 콘서트 예매나 대학 수강신청 등 치열한 선착순 환경에서는 내 스마트폰이나 컴퓨터의 시계가 아니라, <strong>요청을 접수하는 웹서버의 시계</strong>가 오픈 여부를 결정합니다.
            </p>
            <p>
              개인용 기기의 시계가 서버보다 1초만 빨라도 &quot;오픈 전입니다&quot; 오류가 발생하고, 1초만 느려도 이미 수천 명의 대기열 뒤로 밀려나게 됩니다. SERVERTIME은 이러한 시간 차이로 인해 겪는 불편함을 해소하고, 누구나 공정하고 명확한 기준 시각을 바탕으로 오픈 타이밍을 준비할 수 있도록 돕기 위해 시작되었습니다.
            </p>
          </div>
        </section>

        {/* 2. Core Operational Principles */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span>SERVERTIME의 4대 운영 원칙</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-[#090C16] p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>1. 100% 완전 비회원제 정책</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                회원가입, 로그인, 개인 식별 정보(이름, 전화번호, 주민번호 등) 수집을 전면 배제합니다. 사용자의 즐겨찾기와 환경설정은 브라우저 로컬 저장소(localStorage)에만 안전하게 보관됩니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#090C16] p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
                <Database className="h-4 w-4" />
                <span>2. 검증된 데이터 원칙 (0 Fixtures)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                운영 환경에서는 임의로 조작된 가짜(Mock/Fixture) 이벤트나 임의 생성 데이터를 제공하지 않습니다. 실제 공식 예매처의 라이브 데이터와 포털의 검증된 일정만을 수집하여 제공합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#090C16] p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <Cpu className="h-4 w-4" />
                <span>3. 정직한 기술 공시 (과장 광고 금지)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                &quot;100% 절대 일치&quot;, &quot;원자시계급&quot; 등 현실적으로 불가능한 과장 표현을 사용하지 않습니다. HTTP Date 헤더의 1초 규격과 네트워크 왕복 지연(RTT) 오차를 투명하게 공개합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#090C16] p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
                <Users className="h-4 w-4" />
                <span>4. 사용자 편의 중심의 무료 도구</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                정각 카운트다운, 10초 전 사전 알람, 집중모드(전체화면), 미니 팝업 시계, 정각 클릭 훈련 등 오픈에 필요한 모든 기능을 아무런 비용 없이 무료로 이용할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Technical Transparency & Limitations */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <AlertCircle className="h-6 w-6 text-amber-400" />
            <span>기술적 측정 원리 및 한계 고지</span>
          </h2>
          <div className="rounded-2xl premium-card p-6 text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
            <p>
              웹 브라우저 환경에서 대상 서버의 시간을 측정할 때, 웹서버는 HTTP 프로토콜 규격에 맞춰 <code className="text-blue-300 font-mono">Date</code> 헤더를 초(Second) 단위 정수로 제공합니다.
            </p>
            <p>
              SERVERTIME은 다중 Probe를 통해 왕복 네트워크 지연(RTT)을 측정한 후, 서버 기준 시각을 바탕으로 브라우저의 고해상도 단조 시계(<code className="text-blue-300 font-mono">performance.now()</code>)를 사용하여 밀리초를 연속적으로 정밀 보간합니다.
            </p>
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200">
              <strong>유의사항:</strong> 사용자의 인터넷 회선 상태, Wi-Fi 불안정성, 대상 서버의 CDN 구성 방식에 따라 수 밀리초에서 수십 밀리초의 지연 편차가 발생할 수 있습니다. SERVERTIME은 이를 신뢰성 있게 참조할 수 있는 보조 도구로 제공하며, 예매나 신청의 최종 성공을 법적으로 보증하지 않습니다.
            </div>
            <div className="pt-2">
              <Link href="/accuracy" className="text-xs text-blue-400 hover:underline font-semibold">
                자세한 기술 아키텍처 및 보간 원리 확인하기 &gt;
              </Link>
            </div>
          </div>
        </section>

        {/* Contact info */}
        <section className="rounded-2xl border border-slate-800 bg-[#0C1222] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">제휴, 건의 및 문의사항</h3>
            <p className="text-xs text-slate-400 mt-1">
              서비스 개선 제안, 지원 서버 추가 요청, 제휴 문의는 언제든지 열려 있습니다.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition"
          >
            <Mail className="h-4 w-4" />
            <span>문의 페이지 바로가기</span>
          </Link>
        </section>
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
