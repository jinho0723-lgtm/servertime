import { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { SITE_CONFIG } from "@/lib/site-config";
import { ShieldCheck, Cookie, Lock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보처리방침 | SERVERTIME",
  description: "SERVERTIME의 100% 비회원제 정책, 브라우저 로컬 저장소 활용, 구글 애드센스 쿠키 정책을 안내합니다.",
  alternates: {
    canonical: `${SITE_CONFIG.canonicalBase}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Page Header */}
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>PRIVACY POLICY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            SERVERTIME 개인정보처리방침
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            시행일자: 2026년 10월 2일 (최종 개정)
          </p>
        </div>

        {/* Introduction */}
        <section className="rounded-2xl premium-card p-6 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            SERVERTIME(이하 &apos;서비스&apos;)은 이용자의 개인정보를 매우 소중하게 생각하며, 정보통신망 이용촉진 및 정보보호 등에 관한 법률과 개인정보보호법을 준수하고 있습니다.
          </p>
          <p>
            본 개인정보처리방침을 통해 이용자께서 제공하시는 정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
          </p>
        </section>

        {/* 1. 100% Non-membership */}
        <section className="rounded-2xl border border-slate-800 bg-[#090C16] p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-emerald-400" />
            <span>1. 100% 완전 비회원제 및 개인 식별 정보 미수집</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
            <p>
              SERVERTIME은 회원가입이나 로그인을 일체 요구하지 않습니다. 주민등록번호, 실명, 전화번호, 이메일 주소, 비밀번호 등 사용자를 식별할 수 있는 어떠한 개인정보도 서버에 수집하거나 데이터베이스에 영구 저장하지 않습니다.
            </p>
          </div>
        </section>

        {/* 2. Local Storage Usage */}
        <section className="rounded-2xl border border-slate-800 bg-[#090C16] p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Cookie className="h-5 w-5 text-blue-400" />
            <span>2. 브라우저 로컬 저장소(localStorage) 사용</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
            <p>
              서비스는 비회원 사용자의 이용 편의를 위해 브라우저의 로컬 저장소(localStorage)만을 이용합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li>자주 찾는 서버 즐겨찾기 목록</li>
              <li>다크모드/라이트모드 화면 테마 설정</li>
              <li>사용자가 직접 설정한 익명 닉네임 (커뮤니티 글 작성 시 로컬 임시 보관)</li>
              <li>알람 설정 시간 및 사전 알림 옵션</li>
            </ul>
            <p className="text-slate-400 text-xs mt-2">
              이 데이터는 이용자의 기기(브라우저) 내에만 존재하며, 브라우저 캐시 및 사이트 데이터를 삭제하면 언제든지 완전히 초기화됩니다.
            </p>
          </div>
        </section>

        {/* 3. Google AdSense & Third Party Advertising */}
        <section className="rounded-2xl border border-slate-800 bg-[#090C16] p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Cookie className="h-5 w-5 text-amber-400" />
            <span>3. 구글 애드센스 및 제3자 광고 쿠키 정책</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
            <p>
              본 서비스는 지속적인 무료 서비스 제공을 위하여 구글 애드센스(Google AdSense)를 포함한 제3자 광고 네트워크를 게재할 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
              <li>Google을 포함한 제3자 공급업체는 쿠키를 사용하여 이용자가 본 웹사이트나 다른 웹사이트를 과거에 방문한 기록을 바탕으로 광고를 게재합니다.</li>
              <li>Google은 광고 쿠키를 통해 Google 및 파트너 사이트 방문 기록을 바탕으로 적절한 맞춤형 광고를 이용자에게 게재할 수 있습니다.</li>
              <li>
                이용자는 언제든지 <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Google 광고 설정</a>에서 맞춤형 광고 게재를 사용 중지할 수 있습니다.
              </li>
              <li>
                또한 <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">aboutads.info</a>를 방문하여 제3자 공급업체의 맞춤형 광고 게재에 사용되는 쿠키를 일괄 거부할 수 있습니다.
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Automated Access Log & Traffic Hit */}
        <section className="rounded-2xl border border-slate-800 bg-[#090C16] p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-400" />
            <span>4. 접속 통계 및 익명 트래픽 집계</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
            <p>
              인기 서버시간 순위 산출을 위해 익명화된 해시 기반의 접속 카운트(방문 횟수)만을 집계합니다. IP 주소는 솔트(Salt)와 결합된 일방향 해시로 처리되어 원본 IP를 복원하거나 특정 개인을 추적할 수 없습니다.
            </p>
          </div>
        </section>

        {/* 5. Contact Information */}
        <section className="rounded-2xl border border-slate-800 bg-[#0C1222] p-6 space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-400" />
            <span>5. 개인정보 보호 담당자 및 문의</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            개인정보 보호 관련 문의나 서비스 의견은 아래의 공식 창구를 통해 문의하실 수 있습니다.
          </p>
          <div className="pt-2 font-mono text-xs text-blue-400">
            공식 이메일: <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="underline font-bold">{SITE_CONFIG.contactEmail}</a>
          </div>
        </section>
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
