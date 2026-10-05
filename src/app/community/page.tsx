"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileDock } from "@/components/common/MobileDock";
import { getGuestStorage } from "@/lib/storage/guest-storage";
import { AdSlot } from "@/components/common/AdSlot";
import { InFeedAdCard } from "@/components/common/InFeedAdCard";
import { MessageSquare, Heart, Send, Trophy, MessageCircle, ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { getApiUrl } from "@/lib/utils";

type PostCategory = "free" | "tip" | "review" | "qna";

interface CommunityPost {
  id: string;
  category: PostCategory;
  title: string;
  content: string;
  authorNickname: string;
  likes: number;
  commentsCount: number;
  createdAt: number;
}

interface PostComment {
  id: string;
  postId: string;
  authorNickname: string;
  content: string;
  createdAt: number;
}

function formatPostDate(epochMs?: number): string {
  if (!epochMs || isNaN(epochMs) || epochMs <= 0) return "방금 전";
  const now = Date.now();
  const diffSec = Math.floor((now - epochMs) / 1000);
  if (diffSec < 60) return "방금 전";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  const d = new Date(epochMs);
  return d.toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCategoryBadge(cat: string) {
  switch (cat) {
    case "free":
      return { label: "자유", color: "text-emerald-400 bg-emerald-950/40 border border-emerald-500/30" };
    case "tip":
      return { label: "꿀팁", color: "text-blue-400 bg-blue-950/40 border border-blue-500/30" };
    case "review":
      return { label: "후기", color: "text-amber-400 bg-amber-950/40 border border-amber-500/30" };
    case "qna":
      return { label: "Q&A", color: "text-purple-400 bg-purple-950/40 border border-purple-500/30" };
    default:
      return { label: "자유", color: "text-slate-400 bg-slate-800 border border-slate-700" };
  }
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"all" | PostCategory>("all");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("free");
  const [nickname, setNickname] = useState("익명게스트");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Likes tracking in localStorage
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Comments state per post
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const st = getGuestStorage();
    if (st.guestProfile.nickname) {
      setNickname(st.guestProfile.nickname);
    }
    try {
      const savedLikes = JSON.parse(localStorage.getItem("servertime_liked_posts") || "{}");
      setLikedPosts(savedLikes);
    } catch {}
  }, []);

  const loadPosts = useCallback(async (cat: string, targetPage: number, append = false) => {
    try {
      if (append) setIsLoadingMore(true);
      const url = getApiUrl(`/api/community/posts?category=${encodeURIComponent(cat)}&page=${targetPage}&limit=15`);
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.posts && Array.isArray(data.posts)) {
          setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
          setHasMore(Boolean(data.hasMore));
          setPage(targetPage);
        }
      }
    } catch {} finally {
      if (append) setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(activeTab, 1, false);
  }, [activeTab, loadPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticPost: CommunityPost = {
      id: tempId,
      category,
      title: title.trim(),
      content: content.trim(),
      authorNickname: nickname,
      likes: 0,
      commentsCount: 0,
      createdAt: Date.now(),
    };

    // Immediately place at the top of list
    setPosts((prev) => [optimisticPost, ...prev]);
    setShowWriteModal(false);
    setTitle("");
    setContent("");

    try {
      const targetUrl = getApiUrl("/api/community/posts");
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title: optimisticPost.title,
          content: optimisticPost.content,
          authorNickname: nickname,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          setPosts((prev) =>
            prev.map((p) => (p.id === tempId ? data.post : p))
          );
        }
      }
    } catch {
      // Re-fetch to guarantee sync
      loadPosts(activeTab, 1, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (likedPosts[postId]) return; // Already liked

    // Optimistically update count
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
    const updatedLikes = { ...likedPosts, [postId]: true };
    setLikedPosts(updatedLikes);
    try {
      localStorage.setItem("servertime_liked_posts", JSON.stringify(updatedLikes));
    } catch {}

    try {
      await fetch(getApiUrl("/api/community/posts/like"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
    } catch {}
  };

  const toggleComments = async (postId: string) => {
    const isNowOpen = !expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: isNowOpen }));

    if (isNowOpen && !commentsMap[postId]) {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      try {
        const res = await fetch(getApiUrl(`/api/community/comments?postId=${encodeURIComponent(postId)}`), {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.comments) {
            setCommentsMap((prev) => ({ ...prev, [postId]: data.comments }));
          }
        }
      } catch {} finally {
        setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentText = (commentInputMap[postId] || "").trim();
    if (!commentText) return;

    const tempId = `temp-cmt-${Date.now()}`;
    const optimisticComment: PostComment = {
      id: tempId,
      postId,
      authorNickname: nickname,
      content: commentText,
      createdAt: Date.now(),
    };

    // Optimistic addition
    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), optimisticComment],
    }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );
    setCommentInputMap((prev) => ({ ...prev, [postId]: "" }));

    try {
      const res = await fetch(getApiUrl("/api/community/comments"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: commentText,
          authorNickname: nickname,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setCommentsMap((prev) => ({
            ...prev,
            [postId]: prev[postId].map((c) => (c.id === tempId ? data.comment : c)),
          }));
        }
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 flex flex-col justify-between bg-tech-grid pb-20 md:pb-0">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              <span>실시간 익명 커뮤니티</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              회원가입 없이 누구나 자유롭게 일상 잡담, 팁과 후기를 공유하고 소통할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/community/success"
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              <Trophy className="h-4 w-4" />
              <span>성공 인증 보기</span>
            </Link>

            <button
              onClick={() => setShowWriteModal(true)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>글쓰기</span>
            </button>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0C101A] p-1.5 overflow-x-auto shadow-sm dark:shadow-none">
          {[
            { id: "all", label: "전체" },
            { id: "free", label: "자유수다" },
            { id: "tip", label: "티켓팅 꿀팁" },
            { id: "review", label: "예매 후기" },
            { id: "qna", label: "질문/답변" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 min-w-[68px] rounded-xl py-2 text-xs font-bold transition-all ${
                activeTab === t.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Post List */}
        {posts.length === 0 ? (
          <div className="w-full rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0C101A] p-12 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">등록된 게시글이 없습니다.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">로그인 없이 첫 글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, idx) => {
              const isLiked = likedPosts[post.id];
              const isCommentsOpen = expandedComments[post.id];
              const comments = commentsMap[post.id] || [];
              const isCmtLoading = loadingComments[post.id];
              const badge = getCategoryBadge(post.category);

              return (
                <Fragment key={post.id}>
                  <article
                    className="rounded-2xl premium-card p-5 space-y-3.5 hover:border-blue-500/30 transition-all"
                  >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase rounded px-2 py-0.5 font-mono ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{post.authorNickname || "익명게스트"}</span>
                    </div>
                    <span suppressHydrationWarning className="text-[11px] font-mono text-slate-500">
                      {formatPostDate(post.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">{post.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{post.content}</p>

                  {/* Actions: Likes & Comments count button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all ${
                          isLiked
                            ? "border-rose-500/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400" : ""}`} />
                        <span>좋아요 {post.likes}</span>
                      </button>

                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>댓글 {post.commentsCount || 0}</span>
                        {isCommentsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>

                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">100% 완전 익명</span>
                  </div>

                  {/* Comments Accordion */}
                  {isCommentsOpen && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/60 space-y-3 bg-slate-50/90 dark:bg-[#080B14]/60 -mx-5 -mb-5 p-5 rounded-b-2xl">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-400">
                        댓글 {comments.length}개
                      </div>

                      {isCmtLoading ? (
                        <div className="flex items-center justify-center py-4 text-xs text-slate-500 gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>댓글 불러오는 중...</span>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-3 text-xs text-slate-500">
                          아직 등록된 댓글이 없습니다. 첫 댓글을 남겨보세요!
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {comments.map((cmt) => (
                            <div key={cmt.id} className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0A0E1A] p-2.5 text-xs space-y-1 shadow-sm dark:shadow-none">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-blue-600 dark:text-blue-400">{cmt.authorNickname}</span>
                                <span suppressHydrationWarning className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                  {formatPostDate(cmt.createdAt)}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 break-words">{cmt.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment input form */}
                      <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={commentInputMap[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputMap((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          placeholder="익명 댓글을 입력하세요..."
                          maxLength={200}
                          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E1321] px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!(commentInputMap[post.id] || "").trim()}
                          className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition disabled:opacity-40"
                        >
                          등록
                        </button>
                      </form>
                    </div>
                  )}
                </article>

                {/* Subtle In-Feed Native Card after 3rd post */}
                {idx === 2 && (
                  <InFeedAdCard variant="list" slotId="community-infeed-ad" />
                )}
              </Fragment>
            );
          })}

            {/* Pagination / Load More */}
            {hasMore && (
              <div className="text-center pt-2">
                <button
                  onClick={() => loadPosts(activeTab, page + 1, true)}
                  disabled={isLoadingMore}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E1321] px-6 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 shadow-sm dark:shadow-none"
                >
                  {isLoadingMore ? "불러오는 중..." : "게시글 더보기 (+)"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* AdSense Placement */}
        <AdSlot slotId="community-bottom-responsive" format="auto" />

        {/* Write Modal */}
        {showWriteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0C101A] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>익명 글쓰기</span>
                </h3>
                <button
                  onClick={() => setShowWriteModal(false)}
                  className="text-slate-400 hover:text-slate-800 dark:hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PostCategory)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0E1321] p-2.5 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="free">자유수다 / 잡담 (자유롭게 아무 글이나)</option>
                    <option value="tip">티켓팅 꿀팁</option>
                    <option value="review">예매 후기</option>
                    <option value="qna">질문/답변</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력하세요"
                    maxLength={60}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0E1321] p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">내용</label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="내용을 작성하세요 (개인정보는 절대 작성하지 마세요)"
                    maxLength={500}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0E1321] p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWriteModal(false)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? "등록 중..." : "등록"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
