import { NextRequest, NextResponse } from "next/server";
import { productionTrafficTracker } from "@/lib/traffic/traffic-storage";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "hosts" | "events" | "sessions"

  try {
    if (type === "hosts") {
      const hosts = await productionTrafficTracker.getTopHosts(5);
      return NextResponse.json({
        success: true,
        data: hosts,
      });
    }

    if (type === "events") {
      const events = await productionTrafficTracker.getTopEvents(5);
      return NextResponse.json({
        success: true,
        data: events,
      });
    }

    const stats = await productionTrafficTracker.getTrafficStats();
    return NextResponse.json({
      success: true,
      activeUsers: stats.activeUsers,
      topHosts: stats.topHosts,
      topEvents: stats.topEvents,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: (err as Error).message,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostSlug, eventSlug, anonId } = body;

    // Use anonId from body or derive from client IP/session header
    const resolvedAnonId = anonId || request.headers.get("x-forwarded-for")?.split(",")[0] || "guest-anon";

    const tasks: Promise<void>[] = [];
    if (resolvedAnonId) {
      tasks.push(productionTrafficTracker.recordSession(resolvedAnonId));
    }
    if (hostSlug) {
      tasks.push(productionTrafficTracker.recordHostView(hostSlug));
    }
    if (eventSlug) {
      tasks.push(productionTrafficTracker.recordEventView(eventSlug));
    }

    await Promise.all(tasks);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
