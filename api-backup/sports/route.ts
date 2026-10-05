import { NextRequest, NextResponse } from "next/server";
import { KOREAN_SPORTS_SERVERS, SportsTicketServer } from "@/lib/sports-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league");
  const category = searchParams.get("category");
  const query = searchParams.get("q")?.toLowerCase().trim();

  let results: SportsTicketServer[] = [...KOREAN_SPORTS_SERVERS];

  if (category && category !== "all") {
    results = results.filter((s) => s.category === category);
  }

  if (league && league !== "all") {
    results = results.filter((s) => s.league === league);
  }

  if (query) {
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        s.league.toLowerCase().includes(query) ||
        s.homeStadium.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    success: true,
    total: results.length,
    sports: results,
  });
}
