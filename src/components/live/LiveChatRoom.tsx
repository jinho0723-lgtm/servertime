"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, AlertTriangle, Users } from "lucide-react";
import { getGuestStorage } from "@/lib/storage/guest-storage";
import { getApiUrl } from "@/lib/utils";

interface Message {
  id: string;
  roomSlug: string;
  nickname: string;
  text: string;
  timestamp: number;
}

export function LiveChatRoom({
  roomSlug = "general",
  title = "실시간 이벤트 대기실",
}: {
  roomSlug?: string;
  title?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [nickname, setNickname] = useState("익명게스트");
  const [lastSentTime, setLastSentTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isInitialLoad = useRef(true);

  // 1. Load nickname from local storage
  useEffect(() => {
    const st = getGuestStorage();
    if (st.guestProfile.nickname) {
      setNickname(st.guestProfile.nickname);
    }
  }, []);

  // 2. Fetch and periodic poll messages from Edge API with tab visibility awareness
  useEffect(() => {
    let isMounted = true;
    let pollTimer: NodeJS.Timeout | null = null;

    const fetchMessages = async () => {
      // Do not poll while tab is hidden
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch(getApiUrl(`/api/chat/messages?room=${encodeURIComponent(roomSlug)}&limit=50`), {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages) && isMounted) {
            setMessages((prev) => {
              // Avoid re-render if identical length and last message ID
              if (
                prev.length === data.messages.length &&
                prev.length > 0 &&
                prev[prev.length - 1].id === data.messages[data.messages.length - 1].id
              ) {
                return prev;
              }
              return data.messages;
            });

            if (isInitialLoad.current) {
              isInitialLoad.current = false;
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }
          }
        }
      } catch {}
    };

    const startPolling = () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(fetchMessages, 12000); // 12s polling to conserve worker requests
    };

    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const handleVisibility = () => {
      if (typeof document === "undefined") return;
      if (document.hidden) {
        stopPolling();
      } else {
        fetchMessages();
        startPolling();
      }
    };

    fetchMessages();
    startPolling();

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      isMounted = false;
      stopPolling();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [roomSlug]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    // Rate limiting: 2 seconds interval
    const now = Date.now();
    if (now - lastSentTime < 2000) {
      setErrorMsg("메시지는 2초에 한 번만 전송할 수 있습니다.");
      return;
    }

    // Profanity / Spam check
    const forbidden = ["시발", "존나", "개새", "씨발", "광고"];
    const containsBadWord = forbidden.some((word) => trimmed.includes(word));
    if (containsBadWord) {
      setErrorMsg("건전한 채팅 문화를 위해 부적절한 단어는 전송할 수 없습니다.");
      return;
    }

    setIsSending(true);

    // Optimistic message update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      roomSlug,
      nickname,
      text: trimmed,
      timestamp: now,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");
    setLastSentTime(now);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    try {
      const res = await fetch(getApiUrl("/api/chat/messages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug,
          nickname,
          text: trimmed,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || "메시지 전송 실패");
      } else {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? data.message : m))
          );
        }
      }
    } catch {
      setErrorMsg("네트워크 오류로 메시지 전송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[420px] rounded-2xl border border-slate-200 dark:border-[#1E2538] bg-white dark:bg-[#0C101A] overflow-hidden shadow-sm dark:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-[#080B12]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>실시간 대기실</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            닉네임: <strong className="text-slate-700 dark:text-slate-300">{nickname}</strong>
          </span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
            <Users className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
            <p className="text-xs font-medium">아직 등록된 대기실 메시지가 없습니다.</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-600 mt-1">익명으로 첫 응원 메시지를 남겨보세요!</p>
          </div>
        ) : (
          messages.map((m) => {
            const timeStr = new Date(m.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            const isMe = m.nickname === nickname;
            return (
              <div key={m.id} className="text-xs flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className={`font-bold ${isMe ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-slate-700 dark:text-slate-300"}`}>
                    {m.nickname}
                  </span>
                  <span suppressHydrationWarning className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {timeStr}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5 break-words bg-slate-100/90 dark:bg-[#080B12]/40 rounded-lg p-1.5 border border-slate-200/80 dark:border-slate-800/40">
                  {m.text}
                </p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error alert if spam or bad word */}
      {errorMsg && (
        <div className="px-4 py-1.5 bg-rose-50 dark:bg-rose-950/60 border-t border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-[#090C14]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="로그인 없이 응원 메시지 남기기..."
          maxLength={100}
          disabled={isSending}
          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E1321] px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5 text-white" />
        </button>
      </form>
    </div>
  );
}
