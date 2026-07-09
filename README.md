# Zusammen — Birthday Activity Planner

Plan birthday activities for your friend group weeks in advance. No more scrambling on the day.

## Features

- **Group auth** — Sign up, create a group, invite friends via shareable invite code
- **Friend profiles** — Name, date of birth, hobby, city, optional notes
- **Smart dashboard** — Friends sorted by next upcoming birthday, with days-away counter and age they'll turn
- **AI suggestions** — Claude generates 5 activity ideas matched to hobby + city + birth month
- **Plan builder** — Create/edit plans from suggestions or manually; status flow: suggested → confirmed → completed
- **Reminders** — Banner for any friend with a birthday ≤ 8 weeks away and no confirmed plan
- **History** — Timeline of completed celebrations per friend

## Setup

### 1. Clone & install

```bash
git clone <repo>
cd zusammen-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite file path (default: `file:./prisma/dev.db`) |
| `AUTH_SECRET` | Random secret for JWT signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (default: `http://localhost:3000`) |
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) |

### 3. Set up the database

```bash
npx prisma migrate dev
npm run db:seed        # adds 3 example friends + demo user
```

Demo credentials after seeding:
- Email: `demo@zusammen.app`
- Password: `password123`
- Invite code: `demo-group-2026`

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

**SQLite limitation**: Vercel's filesystem is ephemeral — the SQLite database resets on every deploy. SQLite is fine for local dev and self-hosted deployments with persistent volumes.

### Migrate to Postgres for production

1. Create a Postgres database (Vercel Postgres, Neon, Supabase, etc.)
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```
3. Update `prisma.config.ts` datasource URL to the Postgres connection string
4. Replace `@prisma/adapter-libsql` with `@prisma/adapter-pg` in `src/lib/prisma.ts`
5. Run `npx prisma migrate deploy`

### Deploy steps

```bash
npm i -g vercel
vercel
# Set env vars in Vercel dashboard:
# AUTH_SECRET, ANTHROPIC_API_KEY, DATABASE_URL (Postgres), NEXTAUTH_URL
```

## Tech Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Prisma 7** + SQLite via libsql adapter — swap to Postgres for production
- **NextAuth v5** with credentials provider (email + password)
- **Anthropic SDK** (`claude-sonnet-4-6`) — server-side only, key never sent to browser
- **Zod** — input validation on all API routes

## v2 Roadmap

- [ ] **Email notifications** — 8-week advance reminder via Nodemailer/Resend (interface stubbed)
- [ ] **Google Places integration** — Real venue search for AI-suggested location types
- [ ] **Native mobile app** — React Native sharing this API layer
- [ ] **Magic link auth** — Passwordless sign-in via email
- [ ] **Activity voting** — Group members vote on suggestions before confirming
- [ ] **iCal export** — Add confirmed plans directly to calendar
