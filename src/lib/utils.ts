import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the resolved Edge API Base URL or relative path
 * In production or when NEXT_PUBLIC_EDGE_API_URL is configured, directs traffic to Cloudflare Edge Worker
 */
export function getApiUrl(path: string): string {
  const edgeBase = process.env.NEXT_PUBLIC_EDGE_API_URL || "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!edgeBase) return normalizedPath;
  return `${edgeBase.replace(/\/+$/, "")}${normalizedPath}`;
}

/**
 * Returns optimized, resized WebP image URL via Cloudflare-backed edge CDN
 * Compresses 3MB raw PNG/GIF down to <80KB WebP for 95+ mobile PageSpeed
 */
export function getOptimizedImageUrl(url?: string | null, width = 400): string {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("data:") || url.endsWith(".svg")) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;
}

/**
 * Normalizes input domain or URL to clean host slug and standard hostname
 */
export function normalizeDomain(input: string): { hostname: string; slug: string; protocol: string } {
  let cleaned = input.trim().toLowerCase();
  
  // Remove wrapping quotes or spaces
  cleaned = cleaned.replace(/^['"]|['"]$/g, "");
  
  // Extract protocol if present
  let protocol = "https:";
  if (cleaned.startsWith("http://")) {
    protocol = "http:";
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("https://")) {
    protocol = "https:";
    cleaned = cleaned.slice(8);
  }

  // Remove path, query, hash
  const slashIdx = cleaned.indexOf("/");
  if (slashIdx !== -1) {
    cleaned = cleaned.slice(0, slashIdx);
  }
  const colonIdx = cleaned.indexOf(":");
  if (colonIdx !== -1) {
    cleaned = cleaned.slice(0, colonIdx);
  }

  // Remove trailing dots
  cleaned = cleaned.replace(/\.+$/, "");

  // Fallback if empty
  if (!cleaned) {
    cleaned = "servertime.co.kr";
  }

  return {
    hostname: cleaned,
    slug: cleaned,
    protocol,
  };
}

/**
 * Formats epoch ms into { hours, minutes, seconds, milliseconds } strings
 */
export function formatPrecisionTime(epochMs: number) {
  const date = new Date(epochMs);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const millis = String(date.getMilliseconds()).padStart(3, "0");

  return { hours, minutes, seconds, millis };
}

/**
 * Formats remaining duration until target epoch ms
 */
export function formatCountdown(targetEpochMs: number, currentEpochMs: number) {
  const diff = targetEpochMs - currentEpochMs;
  if (diff <= 0) {
    return {
      isPast: true,
      text: "OPEN",
      hours: "00",
      minutes: "00",
      seconds: "00",
      millis: "000",
      totalSeconds: 0,
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const millis = Math.floor(diff % 1000);

  return {
    isPast: false,
    text: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`,
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    millis: String(millis).padStart(3, "0"),
    totalSeconds: Math.floor(diff / 1000),
  };
}

/**
 * Explicit Asia/Seoul (KST) formatters for all UI presentations
 * Storage & API: UTC ISO string (e.g. 2026-10-02T10:00:00.000Z)
 * UI: Always rendered explicitly in Asia/Seoul
 */
export function formatKstDateTime(isoOrEpoch: string | number | Date): string {
  const date = typeof isoOrEpoch === "string" || typeof isoOrEpoch === "number" ? new Date(isoOrEpoch) : isoOrEpoch;
  if (isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatKstTime(isoOrEpoch: string | number | Date): string {
  const date = typeof isoOrEpoch === "string" || typeof isoOrEpoch === "number" ? new Date(isoOrEpoch) : isoOrEpoch;
  if (isNaN(date.getTime())) return "--:--";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatKstTimeWithSec(isoOrEpoch: string | number | Date): string {
  const date = typeof isoOrEpoch === "string" || typeof isoOrEpoch === "number" ? new Date(isoOrEpoch) : isoOrEpoch;
  if (isNaN(date.getTime())) return "--:--:--";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Checks whether an event's openAt time falls strictly within today's 24 hours in KST
 * (From today 00:00:00 to 23:59:59.999 KST)
 */
export function isWithinKstToday(isoOrEpoch: string | number | Date, refDate = new Date()): boolean {
  const targetEpoch = typeof isoOrEpoch === "string" || typeof isoOrEpoch === "number" ? new Date(isoOrEpoch).getTime() : isoOrEpoch.getTime();
  if (isNaN(targetEpoch)) return false;

  const kstTodayDateStr = refDate.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }); // YYYY-MM-DD
  const todayStartKst = Date.parse(`${kstTodayDateStr}T00:00:00+09:00`);
  const todayEndKst = Date.parse(`${kstTodayDateStr}T23:59:59.999+09:00`);

  return targetEpoch >= todayStartKst && targetEpoch <= todayEndKst;
}

/**
 * Checks whether an event's openAt falls within 24 hours relative to current epoch ms
 * (From now to now + 24 hours)
 */
export function isWithin24Hours(isoOrEpoch: string | number | Date, currentEpochMs = Date.now()): boolean {
  const targetEpoch = typeof isoOrEpoch === "string" || typeof isoOrEpoch === "number" ? new Date(isoOrEpoch).getTime() : isoOrEpoch.getTime();
  if (isNaN(targetEpoch)) return false;

  const upperLimit = currentEpochMs + 24 * 60 * 60 * 1000;
  return targetEpoch >= currentEpochMs && targetEpoch <= upperLimit;
}

