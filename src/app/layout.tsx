import type { Metadata } from "next";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.canonicalBase),
  title: {
    default: "서버시간 | 인터파크·YES24·티켓링크·멜론티켓 정밀 서버타임 - SERVERTIME",
    template: "%s | SERVERTIME",
  },
  description:
    "실시간 서버시간 확인! 인터파크 티켓(NOL), YES24, 티켓링크, 멜론티켓, 대학교 수강신청 등 00초 정각 티켓팅을 위한 초단위·밀리초 정밀 서버타임 시계와 오픈 카운트다운을 무료로 제공합니다.",
  keywords: [
    "서버시간",
    "서버시간 확인",
    "서버타임",
    "인터파크 서버시간",
    "인터파크 티켓 서버시간",
    "NOL 티켓 서버시간",
    "YES24 서버시간",
    "티켓링크 서버시간",
    "멜론티켓 서버시간",
    "네이버 서버시간",
    "수강신청 서버시간",
    "네이비즘",
    "타임시커",
    "초단위 시계",
    "밀리초 시계",
    "정각 시계",
    "티켓팅 시계",
    "SERVERTIME",
  ],
  authors: [{ name: "SERVERTIME" }],
  creator: "SERVERTIME",
  publisher: "SERVERTIME",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "서버시간 | 인터파크·YES24·티켓링크·멜론티켓 정밀 서버타임 - SERVERTIME",
    description:
      "실시간 서버시간 확인! 인터파크 티켓(NOL), YES24, 티켓링크, 멜론티켓, 대학교 수강신청 등 00초 정각 티켓팅을 위한 초단위·밀리초 정밀 서버타임 시계와 오픈 카운트다운.",
    url: SITE_CONFIG.canonicalBase,
    siteName: "SERVERTIME",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SERVERTIME - 정밀 서버시간 및 오픈 카운트다운",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "서버시간 | 인터파크·YES24·티켓링크·멜론티켓 정밀 서버타임 - SERVERTIME",
    description:
      "실시간 서버시간 확인! 인터파크 티켓(NOL), YES24, 티켓링크, 멜론티켓, 대학교 수강신청 초단위 정밀 시계.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: SITE_CONFIG.canonicalBase,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
};

import { AdSenseScript } from "@/components/common/AdSenseScript";

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-7016829181538872";
const isProduction = process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#07090E" />
        <link rel="preconnect" href="https://wsrv.nl" crossOrigin="anonymous" />
        <style
          dangerouslySetInnerHTML={{
            __html: `html,body{margin:0;padding:0;background-color:#07090E;color:#f8fafc;box-sizing:border-box;}*,*::before,*::after{box-sizing:inherit;}`,
          }}
        />
      </head>
      <body className="bg-[#07090E] text-slate-100 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
        {isProduction && adsenseClient && <AdSenseScript client={adsenseClient} />}
      </body>
    </html>
  );
}
