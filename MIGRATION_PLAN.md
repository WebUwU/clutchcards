# Migration Plan — Demo → Real App

## Stack decisions
- **DB:** Prisma ORM. Default `sqlite` for local dev; switch `DATABASE_URL` +
  `provider` to `postgresql` for production. One-line change.
- **Auth:** Auth.js (NextAuth v5 beta) with:
  - Discord OAuth provider (user login)
  - Credentials provider (admin login, server-verified, bcrypt hash)
  - JWT/database sessions, role on the token (`user` | `admin`)
- **External API:** HenrikDev (Valorant). Server-only. Key in `HENRIK_API_KEY`.
- **Economy:** all coin/pack/quest/market mutations behind server routes that
  re-check ownership, balances and closed-economy invariants. Client never
  trusted to set coins, mint cards, or grant rewards.

## Phases
1. ✅ Analyse structure (done)
2. Dependencies + Prisma schema + migration + seed
3. Auth.js (Discord + admin credentials) + middleware route protection
4. Server economy core (lib/server/economy + repositories)
5. API routes: profile, inventory, packs/open, market, quests, exchange,
   riot link, match sync, admin CRUD
6. HenrikDev server client + match sync with cooldown + de-dupe + cache
7. Quest engine (server-computed progress from synced matches)
8. Wire selected client pages to API (replace localStorage reads)
9. Stripe scaffold (structure only, no live charges)
10. Image upload/URL support
11. README + .env.example
12. Build + route test

## Closed-economy invariants (enforced server-side)
- Premium → Free only. Never Free → Premium.
- No cashout, gift cards, crypto, external transfer.
- All rewards minted server-side with idempotency (no double-grant).

## What will be fully built vs scaffolded
- **Fully:** DB schema, auth, economy server lib, core API routes, HenrikDev
  client, match sync, quest progress evaluation, admin audit logging, .env, README.
- **Scaffolded (clear TODOs):** Stripe checkout/webhooks (structure, no live
  payment), full migration of every client page (key flows wired; some pages
  still read seed data until swapped), image storage provider (local/URL ready,
  S3 left as TODO).
