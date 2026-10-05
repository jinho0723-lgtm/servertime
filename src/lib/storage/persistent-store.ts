import fs from "fs";
import path from "path";

export interface StoredPost {
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

export interface StoredProof {
  id: string;
  eventName: string;
  seatInfo: string;
  serverUsed: string;
  authorNickname: string;
  hashedAnonId: string;
  likes: number;
  recordedAt: number;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const POSTS_FILE = path.join(DATA_DIR, "community_posts.json");
const PROOFS_FILE = path.join(DATA_DIR, "success_posts.json");

function ensureDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ----------------------------------------------------------------------------
// Community Posts Persistence
// Strictly forbidden in Production environment; used only as dev/test offline fallback
// ----------------------------------------------------------------------------
export function readPersistentPosts(): StoredPost[] {
  if (process.env.NODE_ENV === "production") return [];
  ensureDirectory();
  if (!fs.existsSync(POSTS_FILE)) return [];
  try {
    const raw = fs.readFileSync(POSTS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function writePersistentPost(post: StoredPost): StoredPost[] {
  if (process.env.NODE_ENV === "production") return [post];
  ensureDirectory();
  const current = readPersistentPosts();
  const updated = [post, ...current];
  fs.writeFileSync(POSTS_FILE, JSON.stringify(updated, null, 2), "utf8");
  return updated;
}

// ----------------------------------------------------------------------------
// Success Proofs Persistence
// Strictly forbidden in Production environment; used only as dev/test offline fallback
// ----------------------------------------------------------------------------
export function readPersistentProofs(): StoredProof[] {
  if (process.env.NODE_ENV === "production") return [];
  ensureDirectory();
  if (!fs.existsSync(PROOFS_FILE)) return [];
  try {
    const raw = fs.readFileSync(PROOFS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function writePersistentProof(proof: StoredProof): StoredProof[] {
  if (process.env.NODE_ENV === "production") return [proof];
  ensureDirectory();
  const current = readPersistentProofs();
  const updated = [proof, ...current];
  fs.writeFileSync(PROOFS_FILE, JSON.stringify(updated, null, 2), "utf8");
  return updated;
}
