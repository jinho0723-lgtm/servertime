# TIMEPIN Architecture & Implementation Specification Blueprint

## 1. System Overview & Philosophy
TIMEPIN is a modern, high-precision timing and event discovery platform designed for high-stakes ticketing, course registrations, limited drops, and reservations.
- **Pure Guest Experience:** Zero signup/login or user authentication walls. All user persistence (favorites, custom alarms, practice records, nickname, view history) operates entirely on client-side storage (`localStorage` / `IndexedDB`).
- **Precision Time Engine:** Non-linear continuous synchronization with monotonic clock interpolation (`performance.now()`), multi-probe sampling, median/trimmed-mean RTT calculation, outlier rejection, offset drift estimation, honest confidence grading (e.g., `±18 ms`, `RTT 21 ms`), and requestAnimationFrame rendering.
- **Automated Event Ingestion:** Decoupled source adapters (Official Open APIs, Public Ticket Scrapers/notices, OpenGraph metadata extractors) with confidence scoring, deduplication, auto-classification, and automatic status transition. Administrators only review ingestion anomalies (parser fails, missing open timestamps, low confidence).
- **Design Language:** Dark-first, premium technical UI modeled after `design_reference.png`, combining aesthetics from Apple, Linear, and TradingView. Tabular-num precision clock typography, electric blue primary accents (`#2563EB` / `#3B82F6`), coral/red countdown accents (`#F43F5E` / `#FB7185`), and green live sync indicators (`#10B981`).
- **SEO & Monetization:** High-value SEO dynamic pages (`/server/[slug]`, `/event/[slug]`, `/open/today`, `/practice`, `/tools/*`) with structured metadata (JSON-LD), FAQ and guide content, non-intrusive AdSense slots that never compromise mission-critical timekeeping or Focus Mode.

---

## 2. Directory Structure Blueprint
```text
src/
├── app/
│   ├── layout.tsx                     # Root dark-first layout, header, footer, mobile dock
│   ├── globals.css                    # Tailwind CSS v4 variables, tabular numerals, glow effects
│   ├── page.tsx                       # Main Home (Hero, Input, Today's Open, Trending, Quick Sites)
│   ├── server/
│   │   └── [slug]/
│   │       └── page.tsx               # Server Time Detail (Precision Clock, Sync Grade, Alarms, Modes)
│   ├── event/
│   │   └── [slug]/
│   │       └── page.tsx               # Event Detail (Poster, Countdown, Live Room Chat, Quick Server Sync)
│   ├── open/
│   │   ├── today/page.tsx             # Today's Open Events
│   │   └── week/page.tsx              # Weekly Schedule
│   ├── practice/
│   │   ├── page.tsx                   # Practice Center Hub
│   │   ├── timing/page.tsx            # Exact-second click timing test
│   │   ├── reaction/page.tsx          # Reaction speed test
│   │   ├── seat/page.tsx              # Interactive seat picker drill
│   │   └── queue/page.tsx             # Virtual high-traffic queue simulator
│   ├── live/
│   │   └── page.tsx                   # Real-time traffic, trending hosts, live chat rooms
│   ├── tools/
│   │   ├── countdown/page.tsx         # Precision custom target countdown tool
│   │   └── world-clock/page.tsx       # Global multi-timezone precision clock
│   └── api/
│       ├── time/
│       │   ├── sync/route.ts          # Server timestamp probe endpoint with microsecond headers
│       │   └── proxy-date/route.ts    # Secure HEAD/GET probe proxy for external target domains
│       ├── events/
│       │   ├── route.ts               # Automated events query with filters & status
│       │   └── ingest/route.ts        # Trigger automated adapter pipeline
│       └── chat/
│           └── [roomSlug]/route.ts    # Anonymous room message polling / submission with filter
├── components/
│   ├── common/
│   │   ├── Header.tsx                 # Desktop & Mobile top navigation
│   │   ├── Footer.tsx                 # Footer with SEO links, disclaimer, and guides
│   │   ├── MobileDock.tsx             # Fixed bottom navigation for mobile viewports
│   │   ├── AdBanner.tsx               # Responsible AdSense placeholder container
│   │   └── SearchBar.tsx              # URL/domain search with smart normalization
│   ├── clock/
│   │   ├── PrecisionClockDisplay.tsx  # Tabular large millisecond clock with rAF interpolation
│   │   ├── SyncStatusBadge.tsx        # Live Sync status, RTT, estimated error badge
│   │   ├── AlarmController.tsx        # Audio synthesized & Web Notification alarm manager
│   │   ├── TargetCountdown.tsx        # High-impact coral target countdown
│   │   ├── FocusModeModal.tsx         # Distraction-free full-screen clock & target countdown
│   │   └── MiniClockWindow.tsx        # Detachable compact pop-up clock
│   ├── events/
│   │   ├── TodayOpenGrid.tsx          # Card carousel/grid of today's automatic open events
│   │   └── EventCard.tsx              # Rich event item with live countdown & platform badge
│   ├── live/
│   │   ├── TrendingPanels.tsx         # Popular servers, surging events, real-time viewer lists
│   │   └── LiveChatRoom.tsx           # Anonymous nickname chat with spam limit & profanity filter
│   └── practice/
│       ├── TimingDrill.tsx            # Target second millisecond accuracy tester
│       ├── SeatDrill.tsx              # Fast disappearing seating map drill
│       └── PracticeStats.tsx          # Local history percentile chart & stats
├── lib/
│   ├── engine/
│   │   ├── precision-clock.ts         # Core Monotonic Interpolation & Multi-probe Engine
│   │   ├── sound-synthesizer.ts       # Web Audio API beeps, voice countdown, chime generators
│   │   └── notifications.ts           # Browser notification permission & dispatch helper
│   ├── ingestion/
│   │   ├── types.ts                   # Ingestion interfaces, sources, normalized event schema
│   │   ├── engine.ts                  # Ingestion pipeline: fetch -> parse -> dedupe -> score -> publish
│   │   ├── adapters/
│   │   │   ├── kopis-adapter.ts       # Official open API adapter (KOPIS arts/tickets)
│   │   │   ├── public-page-adapter.ts # Public ticket notice parser
│   │   │   └── og-metadata-adapter.ts # OpenGraph fallback scraper
│   │   └── sample-fixtures.ts         # Isolated seed fixture data strictly separated from prod logic
│   ├── storage/
│   │   ├── guest-storage.ts           # LocalStorage & IndexedDB manager for alarms, favorites, stats
│   │   └── anonymous-session.ts       # Crypto-random anonymous ID and nickname generator
│   ├── security/
│   │   ├── ssrf-validator.ts          # Safe domain verification, IP blocker, DNS rebinding guard
│   │   └── profanity-filter.ts        # Chat moderation & spam rate limiter
│   └── utils.ts                       # Formatters, URL normalizer, tailwind class merger
```

---

## 3. Precision Time Engine Mechanics
1. **Clock Model:**
   - Client records `t0 = performance.now()` immediately before sending probe request.
   - Endpoint returns server receipt and response timestamps (`server_epoch_ms`).
   - Client records `t1 = performance.now()` on response.
   - Round Trip Time: `rtt = t1 - t0`.
   - Midpoint Server Estimate: `midpoint_server_time = server_epoch_ms`.
   - Raw Offset: `raw_offset = midpoint_server_time - (t0 + rtt / 2)`.
2. **Multi-Probe & Outlier Rejection:**
   - Execute 5 successive probes.
   - Discard top and bottom outliers (`trimmed mean` or `median filter`).
   - Derive stabilized `offset` and `estimated_error = rtt_median / 2 + variance`.
3. **Continuous Monotonic Interpolation:**
   - Display time at any frame: `current_display_ms = t_base_epoch + (performance.now() - t_base_perf)`.
   - Render loop via `requestAnimationFrame` ensuring 60-120fps smooth millisecond updates without timer throttling drift.
4. **Adaptive Resync Interval:**
   - Routine: Sync every 30s.
   - T-10m: Sync every 15s.
   - T-3m: Sync every 5s.
   - T-30s: Sync every 1s.
   - T-10s: Lock final offset to avoid jitter during target moment.

---

## 4. UI/UX & Visual Direction
- **Exact Alignment with `design_reference.png`:**
  - **Hero:** Punchy headline "정확한 순간이 당신의 기회를 만듭니다", sub-headline, domain search bar with popular presets (인터파크, 예스24, 티켓링크, 멜론티켓, 네이버예약, 캐치테이블).
  - **오늘의 주요 오픈:** Horizontal cards with opening time badge (`20:00`), title, platform, poster thumbnail, preparation count (`12,382명 준비 중`), and live countdown.
  - **Live Ranking Columns:** 3-column split for "실시간 인기 서버", "급상승 이벤트 (오늘/이번주/이번달)", and "지금 사람들이 보는 곳".
  - **Server Time Detail Page:** Large glowing tabular clock `19:59:58.742`, badges `LIVE SYNC`, `정확도 A+`, metric cards (`서버 상태: 정상`, `예상 오차: ±18 ms`, `서버 응답: 21 ms`, `마지막 동기화: 0.8초 전`), alarm checkboxes, event mode target setup, Focus Mode button, Mini Clock launcher.
  - **Focus Mode:** Fullscreen distraction-free mode with giant clock, big OPEN countdown, minimal sync indicator.
  - **Ticket Practice Center:** 4 tabs (타이밍 연습, 좌석 선택 연습, 대기열 연습, 내 기록) with millisecond deviation grading (`0.284초 상위 7%`).
