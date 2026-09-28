# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Unit tests (Vitest)
npm run test:watch   # Unit tests in watch mode
npm run test:e2e     # E2E tests (Playwright) — requires ENABLE_E2E_TESTING=true
npm run test:e2e:ui  # E2E tests with interactive UI
```

To run a single unit test file: `npx vitest src/lib/rental-utils.test.ts`

## Architecture

**Borlo** is a P2P rental marketplace for Singapore university students (borlo.app). Next.js 16 App Router, React 19, Tailwind CSS 4, Supabase (auth + DB + storage), deployed on Vercel.

### Key data flow

- **Auth**: Email OTP only — restricted to `.edu.sg`/`.edu` domains. University auto-detected from email domain. Supabase Auth → cookie-based server sessions.
- **Listings**: Owners create listings with multi-photo upload. Categories and min rental days enforced.
- **Rental flow**: Renter submits `RequestForm` → `rental_requests` row created → Supabase Edge Function emails owner → owner accepts/declines in `OwnerControls` → renter gets owner's Telegram handle on acceptance.
- **Availability**: `AvailabilityCalendar` fetches accepted + pending requests to block dates. Overlap detection logic lives in `src/lib/rental-utils.ts`.

### Supabase clients

- `src/lib/supabase.ts` — browser client (public anon key)
- `src/lib/supabase-server.ts` — server client (cookie-based session) and admin client (service role key, bypasses RLS)

Use the server client in Server Components and API routes. Use the admin client only when RLS would block a legitimate operation (e.g., reading another user's profile for display).

### Key tables

| Table | Notable columns |
|-------|----------------|
| `listings` | `owner_id`, `daily_price`, `min_days`, `image_urls` (array), `is_available`, `category` |
| `profiles` | `university_name`, `telegram_handle`, `login_count` |
| `rental_requests` | `status` (`pending`/`accepted`/`declined`), `start_date`, `end_date` |

### Edge Function

`supabase/functions/notify-rental-request/` — sends transactional email via Resend when a rental request is created or status changes. Deploy with `supabase functions deploy notify-rental-request`.

### E2E testing

E2E tests use a dedicated test user. Set `ENABLE_E2E_TESTING=true` and `E2E_TEST_PASSWORD` in `.env.local`. The `api/e2e/login` route is only active when that flag is set.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
```
