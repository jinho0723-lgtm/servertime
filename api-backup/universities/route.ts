import { NextRequest, NextResponse } from "next/server";
import { KOREAN_UNIVERSITIES, UniversityCourseServer } from "@/lib/university-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const query = searchParams.get("q")?.toLowerCase().trim();

  let results: UniversityCourseServer[] = [...KOREAN_UNIVERSITIES];

  if (region && region !== "all") {
    results = results.filter((u) => u.region === region);
  }

  if (query) {
    results = results.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.shortName.toLowerCase().includes(query) ||
        u.domain.toLowerCase().includes(query) ||
        u.id.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    success: true,
    total: results.length,
    universities: results,
  });
}
