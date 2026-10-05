# Technical Architecture

## Frontend
- Next.js 15+
- TypeScript
- Tailwind CSS
- shadcn/ui optional
- Server Components where appropriate
- Client Component only for clock/realtime interactions

## Backend
- Next.js Route Handlers or separate Node service
- scheduled ingestion workers
- precision clock service
- realtime gateway

## Database
Supabase PostgreSQL

## Realtime
Supabase Realtime initially.
Scale-out path:
WebSocket service / managed realtime provider.

## Cache
Upstash Redis:
- sync measurement cache
- trending
- rate limit
- active viewer approximations

## Scheduler
Vercel Cron / Supabase Cron / external scheduler.

Jobs:
- ingest ticket sources
- ingest official APIs
- update open events
- archive expired events
- refresh trend rankings
- verify broken images
- recalc host quality

## No Auth
Auth provider를 넣지 않는다.

세션:
crypto-random anonymous id
→ browser persistence
→ hashed server representation where needed.

## Security
- URL SSRF protection
- allow/deny rules
- private IP blocking
- DNS rebinding protection
- fetch timeout
- request rate limit
- XSS sanitization
- chat moderation
- CSP
- Cloudflare WAF
