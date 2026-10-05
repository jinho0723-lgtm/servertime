export interface StorageState {
  favorites: string[]; // host slugs
  history: { slug: string; name: string; host: string; visitedAt: number }[];
  alarmSettings: {
    enabled10m: boolean;
    enabled5m: boolean;
    enabled3m: boolean;
    enabled1m: boolean;
    enabled30s: boolean;
    enabled10s: boolean;
    enabled5s: boolean;
    enabledOnHour: boolean;
    soundType: "digital" | "voice" | "bell";
    soundEnabled: boolean;
    flashEnabled: boolean;
  };
  practiceRecords: {
    id: string;
    type: "timing" | "reaction" | "seat" | "queue";
    diffMs: number;
    percentile: number;
    recordedAt: number;
  }[];
  guestProfile: {
    anonymousId: string;
    nickname: string;
  };
}

const STORAGE_KEY = "TIMEPIN_GUEST_STORE_V1";

function generateAnonymousId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "anon_" + Math.random().toString(36).substring(2, 11);
}

function generateRandomNickname(): string {
  const adjectives = [
    "빛의속도", "초정밀", "행운의", "찰나의", "시계바늘", "나노초", "골든티켓", 
    "포도알러버", "새벽예매", "완벽클릭", "순간포착", "칼각", "타이밍마스터"
  ];
  const nouns = [
    "예매러", "피케팅러", "수강신청왕", "시계토끼", "네이비즘탈출러", "초침", 
    "선예매러", "광클러", "좌석선점러", "스나이퍼", "타임핀러"
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}${noun}${num}`;
}

export const defaultStorageState: StorageState = {
  favorites: ["interpark", "yes24", "ticketlink"],
  history: [
    { slug: "interpark", name: "인터파크 티켓", host: "ticket.interpark.com", visitedAt: Date.now() },
  ],
  alarmSettings: {
    enabled10m: false,
    enabled5m: true,
    enabled3m: true,
    enabled1m: true,
    enabled30s: true,
    enabled10s: true,
    enabled5s: false,
    enabledOnHour: true,
    soundType: "digital",
    soundEnabled: true,
    flashEnabled: false,
  },
  practiceRecords: [
    { id: "1", type: "timing", diffMs: 284, percentile: 7, recordedAt: Date.now() - 3600000 },
    { id: "2", type: "timing", diffMs: 312, percentile: 12, recordedAt: Date.now() - 7200000 },
    { id: "3", type: "timing", diffMs: 428, percentile: 28, recordedAt: Date.now() - 10800000 },
  ],
  guestProfile: {
    anonymousId: "",
    nickname: "",
  },
};

export function getGuestStorage(): StorageState {
  if (typeof window === "undefined") {
    return defaultStorageState;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: StorageState = {
        ...defaultStorageState,
        guestProfile: {
          anonymousId: generateAnonymousId(),
          nickname: generateRandomNickname(),
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.guestProfile?.anonymousId) {
      parsed.guestProfile = {
        anonymousId: generateAnonymousId(),
        nickname: generateRandomNickname(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return defaultStorageState;
  }
}

export function saveGuestStorage(updates: Partial<StorageState>): StorageState {
  if (typeof window === "undefined") return defaultStorageState;
  try {
    const current = getGuestStorage();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return defaultStorageState;
  }
}

export function toggleFavorite(slug: string): boolean {
  const current = getGuestStorage();
  const exists = current.favorites.includes(slug);
  const updatedFavorites = exists
    ? current.favorites.filter((s) => s !== slug)
    : [...current.favorites, slug];
  saveGuestStorage({ favorites: updatedFavorites });
  return !exists;
}

export function addHistoryEntry(entry: { slug: string; name: string; host: string }) {
  const current = getGuestStorage();
  const filtered = current.history.filter((h) => h.slug !== entry.slug);
  const updatedHistory = [{ ...entry, visitedAt: Date.now() }, ...filtered].slice(0, 10);
  saveGuestStorage({ history: updatedHistory });
}

export function recordPracticeResult(type: "timing" | "reaction" | "seat" | "queue", diffMs: number, percentile: number) {
  const current = getGuestStorage();
  const newRecord = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    diffMs,
    percentile,
    recordedAt: Date.now(),
  };
  const updatedRecords = [newRecord, ...current.practiceRecords].slice(0, 50);
  saveGuestStorage({ practiceRecords: updatedRecords });
}
