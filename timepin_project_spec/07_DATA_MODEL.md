# Data Model

## hosts
- id uuid
- domain text unique
- slug text unique
- name text
- category text
- logo_url text
- status text
- last_sync_at timestamptz
- created_at timestamptz

## host_measurements
- id bigint
- host_id uuid
- measured_at timestamptz
- server_epoch_ms bigint
- rtt_ms numeric
- estimated_error_ms numeric
- sample_count int
- quality text

## events
- id uuid
- slug text unique
- title text
- category text
- platform text
- host_id uuid nullable
- source_url text
- official_url text
- image_url text
- open_at timestamptz
- start_at timestamptz nullable
- end_at timestamptz nullable
- venue text nullable
- status text
- confidence_score numeric
- source_type text
- created_at timestamptz
- updated_at timestamptz

## event_sources
- id uuid
- event_id uuid
- source_name text
- source_url text
- fetched_at timestamptz
- raw_hash text
- parser_version text

## anonymous_sessions
가능하면 서버에 영구 사용자 프로필을 만들지 않는다.

필요한 최소 실시간 기능에서만:
- anon_id hash
- first_seen
- last_seen
- abuse_score

## live_rooms
- id uuid
- event_id uuid nullable
- title text
- status text

## messages
- id bigint
- room_id uuid
- anon_id_hash text
- nickname text
- body text
- created_at timestamptz
- deleted_at timestamptz nullable

## practice_aggregate
개인 기록은 로컬 저장이 기본.

서버에는 익명 통계만 선택적으로:
- type
- score_bucket
- created_date
- count

## host_view_stats
- host_id
- bucket_time
- views
- approximate_active_users

## event_view_stats
- event_id
- bucket_time
- views
- approximate_active_users
