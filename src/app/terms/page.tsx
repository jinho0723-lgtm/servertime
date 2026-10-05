import { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { SITE_CONFIG } from "@/lib/site-config";
import { FileText, AlertTriangle, ShieldCheck, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "이용약관 | SERVERTIME",
  description: "SERVERTIME 서비스 이용약관, 책임의 한계, 서비스 성격 및 지적재산권 안내입니다.",
  alternates: {
    canonical: `${SITE_CONFIG.canonicalBase}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Page Header */}
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-300">
            <FileText className="h-3.5 w-3.5" />
            <span>TERMS OF SERVICE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            SERVERTIME 이용약관
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            시행일자: 2026년 10월 2일 (최종 개정)
          </p>
        </div>

        {/* Section 1 */}
        <section className="rounded-2xl border border-slate-800 bg-[#090C16] p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            제 1 조 (목적 및 서비스 성격)
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
            <p>
              본 약관은 SERVERTIME(이하 &apos;서비스&apos;)이 제공하는 실시간 서버시간 측정, 정각 카운트다운, 티켓팅 훈련 시뮬레이터 및 관련 정보 서비스의 이용 조건과 권리·의무 관계를 규정함을 목적으로 합니다.
            </p>
            <p>
              본 서비스는 티켓팅, 수강신청, 예약 등을 준비하는 이용자에게 대상 웹서버의 시스템 기준 시각을 확인하고 참고할 수 있도록 돕는 <strong>무료 보조 유틸리티 도구</strong>입니다.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="rounded-2xl border border-slate-800 bg-[#090C16] p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            제 2 조 (독립성 및 비제휴 고지)
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
            <p>
              SERVERTIME은 NOL 티켓(구 인터파크티켓), YES24, 티켓링크, 멜론티켓, 네이버 등 서비스 내에서 언급되거나 측정되는 <strong>어떠한 제3자 예매처 또는 대학교와도 공식적인 제휴, 대리, 후원 관계가 없는 독립된 서비스</strong>입니다.
            </p>
            <p>
              각 상표, 서비스명, 도메인 이름 및 로고는 해당 권리자의 고유 자산이며, 본 서비스에서는 정보 식별 및 대상 서버 구분을 위한 설명적 용도로만 사용됩니다.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span>제 3 조 (책임의 한계 및 면책 조항)</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 space-y-2.5 leading-relaxed">
            <p>
              1. <strong>예매 성공 비보증:</strong> 티켓팅이나 수강신청의 최종 성공 여부는 이용자의 네트워크 회선 속도, 기기 사양, 대상 예매처의 서버 과부하, 대기열(트래픽 제어), 본인인증, 보안문자(CAPTCHA) 입력 속도, 결제 모듈 정상 작동 여부 등 다양한 외적 요인에 의해 결정됩니다. 따라서 SERVERTIME은 이용자의 예매나 수강신청 성공을 일체 보증하지 않으며, 이로 인해 발생한 어떠한 결과에 대해서도 책임을 지지 않습니다.
            </p>
            <p>
              2. <strong>시간 오차 가능성:</strong> 인터넷 패킷 전송 지연(RTT), 비대칭 라우팅, CDN 프록시 캐싱 등으로 인해 수 밀리초에서 수십 밀리초 수준의 불가피한 오차가 발생할 수 있습니다. 이용자는 이를 인지하고 자체적인 판단하에 서비스를 참조해야 합니다.
            </p>
            <p>
              3. <strong>무료 서비스의 면책:</strong> 본 서비스는 이용자에게 아무런 요금을 청구하지 않는 무료 서비스로서, 천재지변, 정전, 디도스(DDoS) 공격, 호스팅 장애 등으로 인한 서비스 일시 중단에 대해 손해배상 책임을 부담하지 않습니다.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="rounded-2xl border border-slate-800 bg-[#090C16] p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white">
            제 4 조 (이용자의 의무 및 금지행위)
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
            <p>이용자는 다음 각 호의 행위를 하여서는 안 됩니다:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li>서비스의 정상적인 운영을 방해하는 대량의 비정상적 자동화 요청(스파이더, 크롤러, 봇 공격 등)</li>
              <li>타인의 명예를 훼손하거나 불법적인 콘텐츠를 커뮤니티에 게시하는 행위</li>
              <li>서비스의 소스 코드를 무단 리버스 엔지니어링하거나 복제하여 상업적으로 이용하는 행위</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section className="rounded-2xl border border-slate-800 bg-[#0C1222] p-6 space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-400" />
            <span>제 5 조 (문의 및 준거법)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            약관과 관련된 문의는 공식 이메일(<a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-blue-400 underline">{SITE_CONFIG.contactEmail}</a>)을 통해 접수받으며, 본 약관은 대한민국 법률에 따라 규율되고 해석됩니다.
          </p>
        </section>
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
