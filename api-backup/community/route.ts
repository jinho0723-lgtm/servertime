import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface PostItem {
  id: string;
  category: "tip" | "review" | "qna";
  title: string;
  content: string;
  authorNickname: string;
  hashedAnonId: string;
  likes: number;
  commentsCount: number;
  createdAt: number;
}

import { readPersistentPosts, writePersistentPost, StoredPost } from "@/lib/storage/persistent-store";

function hashAnonId(rawId: string): string {
  return crypto
    .createHash("sha256")
    .update(rawId + (process.env.ANON_SALT || "timepin_salt"))
    .digest("hex")
    .substring(0, 16);
}

// Basic HTML sanitization to prevent XSS injection
function sanitizeText(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  // If Supabase credentials exist, optionally query Supabase Free PostgREST directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      let queryUrl = `${supabaseUrl}/rest/v1/community_posts?select=*&order=created_at.desc&limit=50`;
      if (category && category !== "all") {
        queryUrl += `&category=eq.${encodeURIComponent(category)}`;
      }

      const res = await fetch(queryUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, posts: data });
      }
    } catch {}
  }

  // Persistent disk storage surviving full dev server restarts
  let posts = readPersistentPosts();
  if (category && category !== "all") {
    posts = posts.filter((p) => p.category === category);
  }

  return NextResponse.json({ success: true, posts });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, title, content, authorNickname, rawAnonId } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and content required" }, { status: 400 });
    }

    // Input sanitization & length limits
    const sanitizedTitle = sanitizeText(String(title).trim().slice(0, 80));
    const sanitizedContent = sanitizeText(String(content).trim().slice(0, 500));
    const sanitizedNick = sanitizeText(String(authorNickname || "익명게스트").trim().slice(0, 32));

    const hashed = hashAnonId(rawAnonId || request.headers.get("x-forwarded-for") || "anon-client");

    const newPost: StoredPost = {
      id: Math.random().toString(36).substring(2, 9),
      category: category || "tip",
      title: sanitizedTitle,
      content: sanitizedContent,
      authorNickname: sanitizedNick,
      hashedAnonId: hashed,
      likes: 0,
      commentsCount: 0,
      createdAt: Date.now(),
    };

    // If Supabase configured, insert to public.community_posts
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/community_posts`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            category: newPost.category,
            title: newPost.title,
            content: newPost.content,
            author_nickname: newPost.authorNickname,
            hashed_anon_id: newPost.hashedAnonId,
          }),
        });
      } catch {}
    }

    // Persist to disk (.data/community_posts.json) surviving dev server restarts
    writePersistentPost(newPost);
    return NextResponse.json({ success: true, post: newPost });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
