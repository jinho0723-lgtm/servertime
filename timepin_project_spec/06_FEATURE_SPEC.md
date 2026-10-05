# Feature Specification

## 서버시간
- URL 입력
- 도메인 정규화
- 서버 상태
- 밀리초 시계
- RTT
- Estimated Error
- Sync Quality
- 즐겨찾기
- 공유

## Alarm
브라우저 기반.

Preset:
- 10분
- 5분
- 3분
- 1분
- 30초
- 10초
- 5초
- 정각

지원:
- sound
- voice countdown
- screen flash optional
- Web Notification optional

## Event Mode
사용자가 날짜와 목표 시각을 설정.
오픈시각까지 대형 countdown.

## Focus Mode
- 광고 제거
- 실시간 채팅 제거
- 대형 시간
- 대형 countdown
- sync quality 최소 표시
- fullscreen

## Mini Clock
작은 별도 window/popup.
항상 위 기능은 브라우저 제약 범위 내에서 제공.

## Ticket Practice
### Timing
목표 시각에 클릭.

### Seat
빠르게 사라지는 좌석 선택.

### Queue
가상 대기열.

### Reaction
일반 반응속도.

## Guest Persistence
localStorage/IndexedDB:
- nickname
- favorites
- alarm presets
- history
- practice scores
- theme
- sound setting

## Realtime Room
로그인 없음.
anonymous session id + nickname.

기본 안전장치:
- rate limit
- profanity filter
- spam control
- report
- message TTL/retention policy

## 성공 인증
비회원으로 생성.
이미지 생성 후 공유.
개인정보 입력 불필요.
