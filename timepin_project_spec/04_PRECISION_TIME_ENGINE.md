# Precision Time Engine

## 목표
TIMEPIN의 가장 중요한 기술 구성요소.

'밀리초 표시'가 아니라 측정과 보정의 신뢰성이 핵심이다.

## 원칙

### 1. Date.now() 단독 사용 금지
동기화 후 경과시간 측정은 monotonic clock인 performance.now() 기반.

### 2. Multiple Probe
대상 서버 또는 TIMEPIN 측정 노드에서 다수 probe 수행.

샘플:
18ms
19ms
21ms
22ms
87ms <- outlier
20ms

median/trimmed mean 기반 RTT 산정.

### 3. Offset Estimation
송수신 시간을 기반으로 대상 서버 시간과 로컬 monotonic 기준점의 offset 추정.

### 4. Continuous Sync
예시:
- 평상시: 긴 간격
- T-10m: 15초
- T-3m: 5초
- T-30s: 1초
- T-10s: 최종 안정 offset 사용

대상 서버 보호를 위해 사용자 브라우저가 직접 대량 probe하지 않는다.

### 5. Shared Measurement
수천 사용자가 같은 도메인을 볼 경우:
사용자 12,000명
→ TIMEPIN Sync Service
→ Target Server

측정 결과를 캐시하고 공유.

### 6. UI Rendering
Clock Engine
→ requestAnimationFrame
→ Display

OPEN 판정은 화면 문자열이 아니라 clock engine 값을 기준으로 한다.

## 표시할 신뢰정보
- Sync status
- Estimated error
- RTT
- Last sync
- Sample count
- Quality grade

예:
LIVE SYNC
Excellent
Estimated error ±18 ms
RTT 21 ms

## 금지 표현
- 정확도 100%
- 실제 내부 DB clock과 완전히 동일
- 티켓 성공 보장

## 장애 대응
- Date header 부재
- CDN 응답
- 캐시된 Date
- 서버 응답 지연
- 대상 사이트 차단
- Cloudflare/Akamai 등 CDN 계층 차이

Fallback:
TIMEPIN reference clock 표시 + 낮은 confidence 표기.
