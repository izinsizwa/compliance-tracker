# Compliance Tracker

A full-stack app that tracks statutory compliance deadlines — CIPC annual returns, BEE certificate renewals, UIF declarations, COIDA returns, and POPIA reviews — across multiple client businesses, and nudges the owner before a deadline is missed.

## Stack

- **Frontend:** React 19, TypeScript, Vite, React Router — no UI framework, hand-built design system
- **Backend:** Node.js, Express, TypeScript, Zod validation
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT + bcrypt, scoped per-user multi-tenancy (each user only sees their own businesses)


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

