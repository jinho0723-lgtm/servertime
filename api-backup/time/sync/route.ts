import { NextRequest, NextResponse } from "next/server";
import { executeBackendProbe, isSafeDomain } from "@/lib/engine/measurement-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const host = searchParams.get("host") || "ticket.interpark.com";

  if (!isSafeDomain(host)) {
    return NextResponse.json(
      { error: "Invalid or prohibited host domain", host },
      { status: 400 }
    );
  }

  try {
    const probe = await executeBackendProbe(host);
    return NextResponse.json({
      success: true,
      host: probe.host,
      serverEpochMs: probe.serverEpochMs,
      measuredAt: probe.measuredAt,
      rttMs: probe.rttMs,
      hasDateHeader: probe.hasDateHeader,
      httpDateString: probe.httpDateString,
      serverHeader: probe.serverHeader,
      cdnDetected: probe.cdnDetected,
      method: probe.method,
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Server-Time-Ms": String(probe.serverEpochMs),
      }
    });
  } catch (err) {
    const fallbackEpochMs = Date.now();
    return NextResponse.json({
      success: false,
      error: (err as Error).message,
      host,
      serverEpochMs: fallbackEpochMs,
      measuredAt: fallbackEpochMs,
      rttMs: 0,
      hasDateHeader: false,
      httpDateString: null,
      serverHeader: null,
      cdnDetected: null,
      method: "FALLBACK",
    }, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      }
    });
  }
}
