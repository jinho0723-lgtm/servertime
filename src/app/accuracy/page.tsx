import { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { SITE_CONFIG } from "@/lib/site-config";
import { Activity, Cpu, Server, Network, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "기술 안내 및 측정 원리 | SERVERTIME",
  description: "HTTP Date 헤더 1초 해상도 한계, RTT 왕복 지연 보정, performance.now() 단조 시계 밀리초 보간 원리를 투명하게 설명합니다.",
  alternates: {
    canonical: `${SITE_CONFIG.canonicalBase}/accuracy`,
  },
};

export default function AccuracyPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Page Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-300">
            <span>TECHNICAL ARCHITECTURE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            서버시간 측정 및 밀리초 보간 기술 안내
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            SERVERTIME은 정직한 기술 공시를 지향합니다. 외부 웹서버의 시계를 웹 브라우저에서 측정하는 과학적 원리와 현실적 한계점을 투명하게 공개합니다.
          </p>
        </div>

        {/* 1. Core Reality of Web Server Time */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Server className="h-6 w-6 text-blue-400" />
            <span>1. 웹 환경의 시간 프로토콜 규격 (HTTP Date)</span>
          </h2>
          <div className="rounded-2xl premium-card p-6 text-sm text-slate-300 space-y-3 leading-relaxed">
            <p>
              인터넷 표준 규격(RFC 7231 / RFC 9110)에 따라 모든 웹서버는 응답 헤더(<code className="text-blue-300 font-mono">Date</code>)에 초 단위 시각만을 기록하여 반환합니다:
            </p>
            <div className="rounded-xl bg-[#060911] border border-slate-800 p-3.5 font-mono text-xs text-emerald-400">
              Date: Fri, 02 Oct 2026 11:00:00 GMT
            </div>
            <p className="text-xs text-slate-400">
              즉, 어떠한 웹 서비스도 브라우저에게 대상 서버의 내부 밀리초를 직접 전송하지 않습니다. 따라서 웹상에서 &quot;원격 서버의 절대 밀리초를 실시간 수신한다&quot;는 주장은 기술적으로 사실과 다릅니다.
            </p>
          </div>
        </section>

        {/* 2. Honest Millisecond Interpolation Principle */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Cpu className="h-6 w-6 text-cyan-400" />
            <span>2. 밀리초 보간 원리 (정직한 기술 공시)</span>
          </h2>
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
              <div className="space-y-2 text-sm text-slate-200 leading-relaxed">
                <p className="font-bold text-white text-base">
                  화면의 밀리초는 서버가 직접 제공한 millisecond 값이 아니라, 서버 기준 시각을 바탕으로 performance.now()를 사용하여 연속적으로 보간한 표시값입니다.
                </p>
                <p className="text-xs sm:text-sm text-slate-300">
                  SERVERTIME은 대상 서버와의 왕복 시간(RTT)을 정밀 측정한 후, 엣지 프로브가 수신한 서버 기준 초(second)를 기점으로 브라우저 하드웨어 타이머 기반의 고해상도 단조 시계(<code className="text-cyan-300 font-mono">window.performance.now()</code>)를 바인딩하여 1초 사이의 0~999ms를 연속적으로 투영합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Network Uncertainty & RTT */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Network className="h-6 w-6 text-amber-400" />
            <span>3. 네트워크 왕복 시간(RTT)과 불확실도(Uncertainty)</span>
          </h2>
          <div className="rounded-2xl premium-card p-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              클라이언트에서 서버로 패킷이 전달되고 응답이 돌아오는 데에는 물리적인 전송 시간(RTT, Round Trip Time)이 소요됩니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-slate-800 bg-[#090C16] p-4 space-y-1.5">
                <span className="font-bold text-slate-200 text-xs">왕복 지연 (RTT)</span>
                <p className="text-xs text-slate-400">
                  국내 유선 광랜 기준 약 5~25ms, 모바일 LTE/5G 및 Wi-Fi 기준 약 20~60ms 내외가 소요됩니다.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#090C16] p-4 space-y-1.5">
                <span className="font-bold text-slate-200 text-xs">불확실도 (±Uncertainty)</span>
                <p className="text-xs text-slate-400">
                  비대칭 라우팅(상행/하행 지연 차이)을 감안하여 RTT의 절반(RTT / 2)을 측정 불확실도 범위로 투명하게 표시합니다.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 pt-2">
              SERVERTIME은 다중 Probe(연속 측정 샘플링)를 통해 순간적인 네트워크 스파이크(Jitter)를 필터링하고 중앙값(Median)을 취하여 안정적인 기준점을 산출합니다.
            </p>
          </div>
        </section>

        {/* 4. CDN & Reverse Proxy Considerations */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-emerald-400" />
            <span>4. CDN 및 분산 인프라 환경의 영향</span>
          </h2>
          <div className="rounded-2xl premium-card p-6 text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
            <p>
              대규모 트래픽을 처리하는 대형 예매처나 포털은 Cloudflare, Akamai, AWS CloudFront와 같은 CDN(콘텐츠 전송 네트워크) 또는 L4/L7 로드밸런서를 앞단에 배치합니다.
            </p>
            <p>
              이 경우 브라우저가 수신하는 응답은 엣지 프록시 레이어의 시각일 수 있으며, 실제 내부 데이터베이스나 결제 백엔드 서버의 시각과 미세한(수 밀리초 단위) 차이가 존재할 수 있습니다.
            </p>
            <p>
              SERVERTIME의 진단 모달은 응답 헤더의 <code className="text-blue-300 font-mono">Server</code> 및 에지 캐시 식별자를 분석하여 CDN 적용 여부를 사용자에게 시각적으로 안내합니다.
            </p>
          </div>
        </section>

        {/* 5. Recommended Ticketing Strategy */}
        <section className="rounded-2xl border border-slate-800 bg-[#0C1222] p-6 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>정확한 예매를 위한 권장 행동 요령</span>
          </h3>
          <ul className="text-xs sm:text-sm text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li>오픈 최소 10분 전에 SERVERTIME에 접속하여 대상 서버의 RTT와 네트워크 연결 품질을 확인하세요.</li>
            <li>가급적 신호가 불안정한 Wi-Fi나 핫스팟보다 유선 인터넷 또는 안정적인 5G 환경을 이용하세요.</li>
            <li>정각 00초에 즉시 예매 버튼을 클릭할 수 있도록 브라우저 창을 분할 배치하고 사전 카운트다운을 주시하세요.</li>
          </ul>
          <div className="pt-2">
            <Link
              href="/guide"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              <span>실전 티켓팅 가이드 확인하기</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
