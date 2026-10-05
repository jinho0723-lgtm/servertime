import { NextRequest, NextResponse } from "next/server";
import { ingestionEngine } from "@/lib/ingestion/engine";

export const maxDuration = 30; // 30 seconds max duration for Vercel Serverless Function

export async function GET(request: NextRequest) {
  // Verify Cron Secret if configured
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const startTime = Date.now();
    const result = await ingestionEngine.runIngestionPipeline();
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      durationMs,
      ingestionSummary: {
        totalFetched: result.totalFetched,
        totalNormalized: result.totalNormalized,
        publishedCount: result.publishedCount,
        dedupedCount: result.dedupedCount,
        anomaliesCount: result.anomalies.length,
        anomalies: result.anomalies.slice(0, 5), // Include first 5 for inspection
      },
    });
  } catch (err) {
    console.error("[Cron Ingestion] Execution failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
