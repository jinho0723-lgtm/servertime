# Automated Event Ingestion

## 목표
관리자가 매일 이벤트를 입력하지 않는다.

전체 파이프라인:
SOURCE
→ FETCH
→ PARSE
→ NORMALIZE
→ DEDUP
→ CLASSIFY
→ IMAGE
→ CONFIDENCE
→ PUBLISH
→ EXPIRE

## 데이터 소스 계층

### Tier A: 공식 Open API
예:
- 공연 메타데이터 공식 API
- 공공데이터 API
- 스포츠/행사 공개 API

사용:
- 이벤트명
- 공연기간
- 장소
- 출연진
- 포스터
- 공식 URL

### Tier B: 예매처 공개 페이지/공지
티켓 오픈 시각의 주요 소스.

수집 대상 예:
- NOL/인터파크 공개 티켓페이지
- YES24 티켓 공개페이지
- 티켓링크 공개페이지
- 멜론티켓 공개페이지
- 네이버 예약 공개페이지

주의:
robots.txt, 이용약관, rate-limit 및 접근정책을 준수한다.

### Tier C: OG Metadata
페이지에서:
- og:title
- og:description
- og:image
- canonical
을 수집한다.

## 이미지 처리
사람이 직접 업로드하지 않는다.

우선순위:
1. 공식 API poster
2. 공식 ticket page og:image
3. official event image
4. 없으면 플랫폼 로고 + 자동 템플릿 카드

원격 이미지는 직접 영구 복제하지 않고 라이선스/이용정책에 맞춰 처리한다.
필요 시 proxy/cache 정책을 분리한다.

## 자동 분류
category:
- concert
- musical
- sports
- university
- reservation
- popup
- limited_drop
- other

platform:
- interpark
- yes24
- ticketlink
- melon
- naver
- catchtable
- etc

## 자동 공개 조건
confidence_score 기반.

예:
0.90 이상 → 자동 공개
0.70~0.89 → 자동 공개하되 경고 플래그
0.70 미만 → hidden 또는 retry queue

## 중복 판별
키 후보:
- normalized title
- platform
- open_at
- venue
- source_url

semantic similarity 사용 가능.

## 자동 만료
open_at이 지난 뒤:
- LIVE → CLOSED
- 일정기간 후 archive
- SEO 페이지는 필요 시 유지
- 실시간 대기실은 read-only 전환

## 운영자 역할
관리자 페이지는 등록용이 아니라 예외관리용이다.

보여줄 항목:
- parser fail
- missing open_at
- duplicate suspected
- low confidence
- broken image
- source unavailable

정상 이벤트는 관리자 손을 타지 않는다.
