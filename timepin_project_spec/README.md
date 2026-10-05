# TIMEPIN

정밀 서버시간 + 티켓팅/수강신청/예약 오픈 이벤트 플랫폼.

## 제품 방향
- 완전 비회원제
- 관리자 수동등록 최소화
- 자동수집/자동정규화/자동노출
- 밀리초 표시와 동기화 신뢰도 중심
- 반응형/모바일 퍼스트
- SEO + AdSense 기반 트래픽 수익화
- 이벤트 대기실/티켓팅 연습으로 체류시간 확대

## 로그인 정책
TIMEPIN은 기본적으로 회원가입/로그인을 제공하지 않는다.

사용자 상태는 아래 방식으로 유지한다.
- anonymous device/session id
- localStorage
- IndexedDB 필요 시 사용
- browser notification permission
- optional cookie for analytics/session continuity

저장 대상:
- 즐겨찾기 서버
- 최근 조회
- 알람 설정
- 티켓팅 연습 기록
- 닉네임
- UI 환경설정
- 최근 참여 이벤트

## 핵심 화면
1. 메인
2. 서버시간 상세
3. 이벤트 상세
4. 티켓팅 Focus Mode
5. 티켓팅 연습센터
6. 모바일 화면
7. 오늘의 오픈
8. 실시간 인기/급상승

## 포함 문서
- 01_PRODUCT_SPEC.md
- 02_INFORMATION_ARCHITECTURE.md
- 03_UI_UX_SPEC.md
- 04_PRECISION_TIME_ENGINE.md
- 05_AUTOMATED_EVENT_INGESTION.md
- 06_FEATURE_SPEC.md
- 07_DATA_MODEL.md
- 08_TECH_ARCHITECTURE.md
- 09_SEO_ADSENSE.md
- 10_ROADMAP.md
- 11_CODEX_MASTER_PROMPT.md
- 12_ANTIGRAVITY_MASTER_PROMPT.md
- 13_IMPLEMENTATION_CHECKLIST.md
- design_reference.png

## 핵심 원칙
TIMEPIN은 단순히 밀리초 숫자를 보여주는 서비스가 아니다.

사용자에게 다음을 함께 보여준다.
- 대상 서버 기준 추정 시간
- RTT
- Offset
- Last Sync
- Estimated Error
- Sync Quality

정확도 100% 같은 표현은 금지한다.
