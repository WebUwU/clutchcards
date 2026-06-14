# Ascendant Cards

A Valorant-inspired collectible-card platform: quests, packs, collection, a
closed-economy market and a shop — now backed by a **real database, real
authentication and server-authoritative economy**.

> Not affiliated with Riot Games. No official Riot/Valorant assets are used.

---

## What changed: Demo → Real App

The previous version stored everything in the browser (localStorage) and trusted
the client. This version moves all important logic to the server:

- **Database** (Prisma + SQLite locally, Postgres in production) instead of localStorage
- **Real accounts & sessions** via Auth.js (Discord OAuth + server-verified admin login)
- **Roles**: `user` and `admin`, enforced in middleware and every admin API
- **Server-authoritative economy**: pack opening, coin grants, quest rewards,
  market buy/sell and Premium→Free exchange all happen in server routes inside DB
  transactions. The client can never set coins, mint cards or grant rewards.
- **Riot/Valorant linking** + **match sync** via the HenrikDev API (server-side only)
- **Server-computed quests** derived from synced matches (no client-side progress)
- **Audit logs** and **API sync logs**

The old localStorage code (`src/lib/localDb.ts`, `useLocalDb`) still exists so the
original screens keep rendering, but all **trusted** actions now have secure API
routes under `src/app/api/*`. Migrating each screen to call the API is ongoing
(see "Known issues / next steps").

---

## Tech Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion ·
**Prisma** · **Auth.js (next-auth v5)** · **zod** · **bcryptjs**

---

## Setup

### 1. Install
```bash
cd ascendant-cards
npm install
```

### 2. Environment
Copy `.env.example` to `.env` and fill in values:

```
DATABASE_URL="file:./dev.db"          # SQLite for local; Postgres URL for prod
AUTH_SECRET="..."                      # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

DISCORD_CLIENT_ID="..."                # Discord OAuth app
DISCORD_CLIENT_SECRET="..."

HENRIK_API_KEY="..."                   # HenrikDev API key (server only)

ADMIN_EMAIL="admin@ascendant.local"
ADMIN_PASSWORD="..."                   # hashed into the DB by the seed

STRIPE_SECRET_KEY=""                   # optional, payments scaffold
STRIPE_WEBHOOK_SECRET=""
```

> **Secrets are server-only.** Nothing sensitive is exposed to the client. The
> HenrikDev and Stripe keys are read exclusively inside server routes.

### 3. Database
```bash
npx prisma migrate dev --name init   # create schema
npm run db:seed                       # seed cards/packs/quests + admin user
```

### 4. Run
```bash
npm run dev        # http://localhost:3000
# or
npm run build && npm run start
```

Useful:
```bash
npm run db:studio   # open Prisma Studio to inspect data
```

---

## Authentication

- **Players** sign in at `/login` with **Discord**. On first login a `Profile`
  and `Settings` row are created automatically.
- **Admins** sign in at `/login` with email + password (the seed creates the
  admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`, stored as a bcrypt hash). The
  `/admin` area is gated by middleware to `role === "admin"`.

To promote a user to admin, set their `role` to `admin` in the DB (Prisma Studio).

---

## Discord login

1. Create an application at the Discord Developer Portal.
2. Add redirect URL `http://localhost:3000/api/auth/callback/discord`.
3. Put the client id/secret in `.env`.

## Riot / Valorant linking + HenrikDev

- On the profile page, the **Valorant Account** card lets a user enter
  `Name`, `TAG` and `Region`. The server validates via HenrikDev
  (`/valorant/v1/account/...`) and stores name, tag, region and PUUID.
- **Check Matches** (`POST /api/riot/sync`) pulls recent matches, de-dupes by
  `(userId, matchId)`, caches a subset per match, and recomputes quests. It is
  rate-limited and has a per-account cooldown so the API isn't hammered.
- Docs: https://docs.henrikdev.xyz/ — the key lives only in `HENRIK_API_KEY`.

Without a configured key, linking still stores the account (unverified) but match
sync returns a clear "needs API key" response rather than inventing data.

---

## Economy (server-enforced)

All of these run server-side, in transactions, with ownership/balance checks:

| Action            | Route                  |
|-------------------|------------------------|
| Open pack         | `POST /api/packs/open` |
| Buy listing       | `POST /api/market/buy` |
| Create listing    | `POST /api/market/sell`|
| Cancel listing    | `POST /api/market/cancel` |
| Premium → Free    | `POST /api/exchange`   |
| Claim quest       | `POST /api/quests/claim` |

Invariants enforced in `src/lib/server/economy.server.ts`:
- Premium → Free only; **Free → Premium throws** and has no endpoint.
- No cashout, gift cards, crypto or external transfer anywhere.
- Rewards are minted once (quest claims are idempotent via a unique constraint).
- Market has anti-self-trading; listed cards are escrowed out of inventory.

---

## Database schema (Prisma)

`User, Account, Session` (auth) · `Profile, Settings` · `CardSet, Rarity,
CardType, Card, Pack` (catalog) · `InventoryItem` · `MarketListing, Transaction`
(market + history) · `PackOpening, Exchange` · `Quest, QuestProgress,
QuestRewardClaim` · `LinkedAccount, ValorantAccount, SyncedMatch` ·
`AuditLog, ApiSyncLog`. See `prisma/schema.prisma`.

Switch to Postgres for production: set `provider = "postgresql"` in
`prisma/schema.prisma` and a Postgres `DATABASE_URL`, then `npx prisma migrate deploy`.

---

## Admin panel

The `/admin` UI remains, and DB-backed admin APIs exist:
`GET/POST/DELETE /api/admin/cards`, `GET /api/admin/audit`,
`POST /api/admin/reset` (admin-only gameplay reset), `POST /api/admin/upload`
(image upload to `/public/images/uploads`). Image fields also accept plain URLs.
Every admin mutation writes an `AuditLog` entry.

---

## Payments (Stripe scaffold)

`POST /api/stripe/checkout` and `POST /api/stripe/webhook` exist as structure.
They return `501` until `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` are set and
the handlers are completed. Premium coins may only ever be minted by a verified
webhook event — never by the client.

---

## Security summary

Server-only secrets · input validation (zod) on every route · per-user rate
limiting · match-sync cooldown · ownership checks on inventory/market · bcrypt
admin passwords · JWT sessions with DB-refreshed roles · audit + API logs ·
soft-deletes for catalog items.

---

## Deployment

1. Provision Postgres; set `DATABASE_URL` and `provider="postgresql"`.
2. Set all `.env` secrets (`AUTH_SECRET`, Discord, Henrik, admin, Stripe).
3. `npx prisma migrate deploy && npm run db:seed`.
4. `npm run build && npm run start` behind your host of choice.
5. For uploads at scale, replace the local upload route with S3/R2 (TODO).

---

## Known issues / next steps

- **Client migration in progress:** several screens (collection, market, shop,
  dashboard) still read seed/localStorage for display. The secure API routes
  exist; wiring each screen to them (and removing localStorage reads) is the next
  step. Pack-open, exchange, market and quest *mutations* already have server routes.
- **Stripe** is scaffold-only (no live charges).
- **Image storage** is local disk; move to object storage for production.
- **Quests** support core metrics (matches played/won, kills, headshots, agent,
  map, daily login). `rewardPackId` on a quest isn't auto-opened yet.
- Rate limiter is in-memory (per instance); use Redis for multi-instance.
