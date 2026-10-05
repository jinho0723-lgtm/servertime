import { NextRequest, NextResponse } from "next/server";
import { ingestionEngine } from "@/lib/ingestion/engine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const platform = searchParams.get("platform") || undefined;
  const status = searchParams.get("status") || undefined;

  // Run pipeline once if engine is not initialized yet
  if (!ingestionEngine.isInitialized()) {
    await ingestionEngine.runIngestionPipeline();
  }

  const events = ingestionEngine.getEvents({ category, platform, status });
  return NextResponse.json({
    success: true,
    count: events.length,
    events,
  });
}
