import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface SuccessItem {
  id: string;
  eventName: string;
  seatInfo: string;
  serverUsed: string;
  authorNickname: string;
  hashedAnonId: string;
  likes: number;
  recordedAt: number;
}

import { readPersistentProofs, writePersistentProof, StoredProof } from "@/lib/storage/persistent-store";

function hashAnonId(rawId: string): string {
  return crypto
    .createHash("sha256")
    .update(rawId + (process.env.ANON_SALT || "timepin_salt"))
    .digest("hex")
    .substring(0, 16);
}

function sanitizeText(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/success_posts?select=*&order=created_at.desc&limit=50`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, proofs: data });
      }
    } catch {}
  }

  // Persistent disk storage surviving dev server restart
  const proofs = readPersistentProofs();
  return NextResponse.json({ success: true, proofs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, seatInfo, serverUsed, authorNickname, rawAnonId } = body;

    if (!eventName || !seatInfo) {
      return NextResponse.json({ success: false, error: "Event name and seat required" }, { status: 400 });
    }

    const sanitizedEvent = sanitizeText(String(eventName).trim().slice(0, 60));
    const sanitizedSeat = sanitizeText(String(seatInfo).trim().slice(0, 60));
    const sanitizedServer = sanitizeText(String(serverUsed || "인터파크 티켓").trim().slice(0, 32));
    const sanitizedNick = sanitizeText(String(authorNickname || "익명게스트").trim().slice(0, 32));

    const hashed = hashAnonId(rawAnonId || request.headers.get("x-forwarded-for") || "anon-client");

    const item: StoredProof = {
      id: Math.random().toString(36).substring(2, 9),
      eventName: sanitizedEvent,
      seatInfo: sanitizedSeat,
      serverUsed: sanitizedServer,
      authorNickname: sanitizedNick,
      hashedAnonId: hashed,
      likes: 0,
      recordedAt: Date.now(),
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/success_posts`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_name: item.eventName,
            seat_info: item.seatInfo,
            server_used: item.serverUsed,
            author_nickname: item.authorNickname,
            hashed_anon_id: item.hashedAnonId,
          }),
        });
      } catch {}
    }

    // Persist to disk (.data/success_posts.json) surviving dev server restart
    writePersistentProof(item);
    return NextResponse.json({ success: true, proof: item });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
