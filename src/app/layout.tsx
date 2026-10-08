import type { Metadata } from "next";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.canonicalBase),
  title: {
    default: "서버시간 - 티켓팅·수강신청 정확한 서버시간 | SERVERTIME",
    template: "%s | SERVERTIME",
  },
  description: SITE_CONFIG.shortDescription,
  keywords: [
    "서버시간",
    "티켓팅 서버시간",
    "NOL 티켓 서버시간",
    "인터파크 티켓 서버시간",
    "YES24 서버시간",
    "티켓링크 서버시간",
    "멜론티켓 서버시간",
    "네이버 서버시간",
    "수강신청 서버시간",
    "SERVERTIME",
    "서버타임",
  ],
  authors: [{ name: "SERVERTIME" }],
  creator: "SERVERTIME",
  publisher: "SERVERTIME",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "SERVERTIME - 정확한 서버시간, 결정적인 순간을 놓치지 마세요.",
    description: SITE_CONFIG.shortDescription,
    url: SITE_CONFIG.canonicalBase,
    siteName: "SERVERTIME",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SERVERTIME - 정확한 서버시간, 결정적인 순간을 놓치지 마세요.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SERVERTIME - 정확한 서버시간",
    description: SITE_CONFIG.shortDescription,
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
        <style
          dangerouslySetInnerHTML={{
            __html: `html,body{margin:0;padding:0;background-color:#07090E;color:#f8fafc;box-sizing:border-box;}*,*::before,*::after{box-sizing:inherit;}`,
          }}
        />
        {isProduction && adsenseClient && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="bg-[#07090E] text-slate-100 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
