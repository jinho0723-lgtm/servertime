# Codex Master Prompt

아래 요구사항으로 TIMEPIN 프로젝트를 구현하라.

## 프로젝트
정밀 서버시간 + 자동수집형 오픈 이벤트 플랫폼.

## 최우선 요구
1. 완전 비회원제.
2. 로그인/회원가입 기능을 만들지 않는다.
3. 관리자 수동 이벤트 등록에 의존하지 않는다.
4. 자동 ingestion pipeline을 만든다.
5. Precision Time Engine을 기능 중심부로 구현한다.
6. 반응형/모바일 퍼스트.
7. design_reference.png의 시각적 방향을 참고한다.
8. 정밀 계측기/프리미엄 테크 UI로 구현한다.
9. 광고가 핵심 시간 도구를 방해하지 않게 한다.

## Stack
- Next.js 15+
- TypeScript
- Tailwind
- PostgreSQL/Supabase
- Redis optional abstraction
- Zod
- Vitest or Jest
- Playwright

## 비회원 상태
localStorage/IndexedDB 사용:
- favorites
- history
- alarms
- nickname
- practice scores
- preferences

anonymous id는 crypto random으로 생성.
서버에 전송 시 필요 이상의 식별정보 저장 금지.

## Pages
/
 /server/[slug]
 /open/today
 /open/week
 /event/[slug]
 /practice
 /practice/timing
 /practice/seat
 /live
 /tools/*

## Precision Clock
Date.now() 기반 setInterval 시계만 구현하지 말 것.
performance.now() 기반 monotonic interpolation 사용.
measurement model:
- multiple samples
- outlier rejection
- median RTT
- estimated offset
- estimated error
- last sync
- quality grade

UI:
LIVE SYNC
19:59:58.742
Estimated Error ±xx ms
RTT xx ms

## Event Ingestion
Source adapter architecture:
interface EventSourceAdapter

각 adapter:
fetch()
parse()
normalize()

Pipeline:
fetch
→ normalize
→ dedupe
→ classify
→ confidence
→ publish

공식 API / 공개 페이지 / OG metadata를 adapter로 분리.

## UI
Dark-first.
큰 tabular numeric clock.
Electric blue accent.
Event countdown은 coral accent.
Success는 green.

Focus Mode는 모든 부가요소를 제거.

## Testing
반드시 테스트:
- clock interpolation
- offset calculations
- outlier rejection
- domain normalization
- SSRF protection
- event deduplication
- event expiration
- local guest preferences
- responsive basic e2e

## 작업 방식
먼저 전체 repo 구조를 분석/설계하고 구현.
임시 mock 데이터를 production 코드에 하드코딩하지 않는다.
외부 source가 없는 개발환경에선 fixtures를 명확히 분리한다.
