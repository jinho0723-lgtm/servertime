export interface ServerProbeMeasurement {
  host: string;
  measuredAt: number;
  serverEpochMs: number;
  rttMs: number;
  hasDateHeader: boolean;
  httpDateString: string | null;
  serverHeader: string | null;
  cdnDetected: string | null;
  method: "HEAD" | "GET";
}

// In-memory cache for shared measurements (1500ms window)
interface CachedServerMeasurement {
  data: ServerProbeMeasurement;
  cachedAt: number;
}

const serverProbeCache = new Map<string, CachedServerMeasurement>();
const PROBE_CACHE_TTL_MS = 1500;

/**
 * Validates domain safety to prevent SSRF and private network scanning
 */
export function isSafeDomain(domain: string): boolean {
  const d = domain.trim().toLowerCase();
  if (!d) return false;

  // Block private IPs and loopbacks
  if (
    d === "localhost" ||
    d.startsWith("127.") ||
    d.startsWith("10.") ||
    d.startsWith("192.168.") ||
    d.startsWith("172.16.") ||
    d.startsWith("169.254.") ||
    d.endsWith(".local") ||
    d.endsWith(".internal")
  ) {
    return false;
  }

  // Must contain valid domain syntax
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  return domainRegex.test(d);
}

/**
 * Executes an actual real HTTP HEAD/GET probe to the target domain,
 * recording precise microsecond timestamps, inspecting Date headers,
 * detecting CDN edge layers (Cloudflare, Akamai, etc.).
 */
export async function executeBackendProbe(targetHost: string): Promise<ServerProbeMeasurement> {
  const now = Date.now();
  const cached = serverProbeCache.get(targetHost);
  if (cached && now - cached.cachedAt < PROBE_CACHE_TTL_MS) {
    const elapsed = now - cached.cachedAt;
    return {
      ...cached.data,
      measuredAt: now,
      serverEpochMs: cached.data.serverEpochMs + elapsed,
    };
  }

  if (!isSafeDomain(targetHost)) {
    throw new Error(`Invalid or disallowed host: ${targetHost}`);
  }

  const targetUrl = `https://${targetHost}`;
  const t0 = performance.now();
  const wallT0 = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  let res: Response;
  let method: "HEAD" | "GET" = "HEAD";

  try {
    res = await fetch(targetUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": "SERVERTIME-PrecisionEngine/1.0 (+https://servertime.co.kr/about)",
        "Accept": "*/*",
      },
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    // If HEAD is blocked or rejected, attempt lightweight GET fallback
    method = "GET";
    res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "SERVERTIME-PrecisionEngine/1.0 (+https://servertime.co.kr/about)",
        "Range": "bytes=0-0",
      },
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const t1 = performance.now();
  const wallT1 = Date.now();
  const rttMs = Math.max(0.1, Math.round((t1 - t0) * 100) / 100);

  const dateHeader = res.headers.get("date");
  const serverHeader = res.headers.get("server");
  const cfRay = res.headers.get("cf-ray");
  const akamai = res.headers.get("x-akamai-transformed");

  let cdnDetected: string | null = null;
  if (cfRay) cdnDetected = "Cloudflare";
  else if (akamai) cdnDetected = "Akamai";
  else if (serverHeader && /cloudflare|akamai|fastly|cloudfront/i.test(serverHeader)) {
    cdnDetected = serverHeader;
  }

  let serverEpochMs: number;
  let hasDateHeader = false;

  if (dateHeader) {
    const parsedDate = Date.parse(dateHeader);
    if (!isNaN(parsedDate)) {
      hasDateHeader = true;
      // HTTP Date header resolution is 1 second.
      // We align the integer seconds with the wall clock's sub-second fraction at response midpoint
      const subsecondFraction = Math.floor((wallT0 + rttMs / 2) % 1000);
      serverEpochMs = parsedDate + subsecondFraction;
    } else {
      serverEpochMs = wallT0 + Math.round(rttMs / 2);
    }
  } else {
    serverEpochMs = wallT0 + Math.round(rttMs / 2);
  }

  const measurement: ServerProbeMeasurement = {
    host: targetHost,
    measuredAt: wallT1,
    serverEpochMs,
    rttMs,
    hasDateHeader,
    httpDateString: dateHeader,
    serverHeader,
    cdnDetected,
    method,
  };

  serverProbeCache.set(targetHost, {
    data: measurement,
    cachedAt: wallT1,
  });

  return measurement;
}
