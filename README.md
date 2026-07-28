# Compliance Tracker

A full-stack app that tracks statutory compliance deadlines — CIPC annual returns, BEE certificate renewals, UIF declarations, COIDA returns, and POPIA reviews — across multiple client businesses, and nudges the owner before a deadline is missed.

This started as a business-model exercise: in South Africa, [nearly 800,000 companies were deregistered by CIPC in a single month](https://www.cipc.co.za) for missing annual return filings, often triggering frozen bank accounts and personal director liability. The reminders-only version of this idea turned out to be a weak business (full-service filing agents already out-compete a pure nudge tool on price), so this repo exists as a **portfolio build**: a clean, typed, full-stack reference implementation rather than a monetized product.

## Stack

- **Frontend:** React 19, TypeScript, Vite, React Router — no UI framework, hand-built design system
- **Backend:** Node.js, Express, TypeScript, Zod validation
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT + bcrypt, scoped per-user multi-tenancy (each user only sees their own businesses)

## Why these choices

- **Status is derived, not stored.** A requirement's `overdue` / `due_soon` / `on_track` state is computed from `dueDate` on every read (`server/src/lib/status.ts`), so there's no background job required to keep a status column in sync, and no risk of it drifting from the truth.
- **Ownership is enforced at the query layer**, not just the UI. Every business and requirement route re-checks `ownerId` server-side (see `assertOwnsRequirement` in `server/src/routes/requirements.ts`), so one user can never read or modify another user's data by guessing an ID.
- **Nudges are logged, not faked silently.** The `/requirements/:id/nudge` endpoint writes a `Nudge` row and is where a real email (Resend/SES) or WhatsApp Business API call would plug in — the seam is deliberately obvious in the code.

## Project structure

```
compliance-tracker/
├── server/              Express + TypeScript API
│   ├── prisma/schema.prisma
│   └── src/
│       ├── routes/      auth, businesses, requirements, dashboard
│       ├── middleware/  JWT auth guard
│       ├── lib/         prisma client, auth helpers, status logic
│       └── scripts/     seed.ts — demo data
├── client/              React + TypeScript SPA
│   └── src/
│       ├── pages/       Login, Register, Dashboard
│       ├── components/  Modal, MetricCard, StatusStamp, forms
│       ├── context/     AuthContext (JWT session)
│       └── api/         typed fetch wrapper + endpoint functions
└── docker-compose.yml   local Postgres for development
```

## Running it locally

**1. Start Postgres**

```bash
docker compose up -d
```

**2. Set up and run the API**

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed      # creates a demo user + sample businesses/deadlines
npm run dev       # http://localhost:4000
```

**3. Set up and run the client**

```bash
cd client
cp .env.example .env
npm install
npm run dev       # http://localhost:5173
```

**4. Sign in**

Use the pre-filled demo credentials on the login screen:
- Email: `demo@compliancetracker.dev`
- Password: `demo1234`

## Troubleshooting

If `npx prisma generate` fails to download its engine binaries (common on restricted networks or corporate firewalls), set:

```bash
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
```

and retry, or run it from a network without domain restrictions.

## What's deliberately left out

This is a portfolio piece, not a production SaaS, so a few things are intentionally out of scope: real email/WhatsApp delivery (the nudge endpoint logs intent rather than calling a provider), password reset flows, and rate limiting. Each would be a natural "what I'd add next" talking point in an interview.
