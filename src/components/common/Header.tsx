"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Clock, Calendar, Trophy, Radio, MessageSquare, Wrench, Search, Moon, Sun } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check saved theme or system preference on client mount
    try {
      const saved = localStorage.getItem("servertime_theme") || localStorage.getItem("timepin_theme");
      if (saved === "light") {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      } else {
        setIsDark(true);
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    } catch {
      // Fallback
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    try {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        localStorage.setItem("servertime_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        localStorage.setItem("servertime_theme", "light");
      }
    } catch {
      // Fallback
    }
  };

  const navItems = [
    { label: "서버시간", href: "/server", icon: Clock },
    { label: "오늘의 오픈", href: "/open/today", icon: Calendar },
    { label: "티켓팅 연습", href: "/practice", icon: Trophy },
    { label: "실시간", href: "/live", icon: Radio },
    { label: "커뮤니티", href: "/community", icon: MessageSquare },
    { label: "가이드", href: "/guide", icon: Wrench },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-[#1A2234] bg-white/90 dark:bg-[#07090E]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-slate-900 dark:text-white text-lg leading-none">SERVERTIME</span>
              <span className="text-[10px] font-medium tracking-widest text-blue-600 dark:text-blue-400 font-mono">THE EXACT MOMENT</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: Search & Interactive Dark/Light Theme Toggle Button */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/server"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-[#263147] bg-slate-100/90 dark:bg-[#101522] px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500/50 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">서버 검색</span>
          </Link>

          <button
            onClick={toggleTheme}
            type="button"
            title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-[#212A3D] bg-slate-100/90 dark:bg-[#0E131F] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-blue-500/50 transition-all cursor-pointer"
          >
            {isDark ? (
              <Moon className="h-4 w-4 text-blue-400 hover:rotate-12 transition-transform" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500 hover:rotate-45 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
