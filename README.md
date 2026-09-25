# Vantra

A full SaaS starter: auth (email/password + Google), a protected dashboard backed by real per-workspace data, and the schema in place for Stripe billing.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- Auth.js (NextAuth v5) + Prisma adapter
- Postgres (Neon) + Prisma ORM
- bcryptjs for password hashing
- Resend for transactional email (email verification, password reset, invites)

## Setup

1. Install dependencies (already run in this scaffold, but if you `npm ci` fresh):

   ```bash
   npm install --legacy-peer-deps
   ```

2. Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: create a free Postgres database at https://neon.tech and paste its connection string.
   - `AUTH_SECRET`: run `npx auth secret` to generate one.
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`: OAuth credentials from https://console.cloud.google.com/apis/credentials (optional in local dev - credentials login works without it).
   - `RESEND_API_KEY` / `EMAIL_FROM`: see [Email](#email). Optional in local dev.

3. Push the schema to your database and generate the Prisma client:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000` - sign up, log in, and you will land on `/dashboard`.

## What's built

- [x] Sign up (`/signup`) - hashes the password, creates the user + personal workspace, sends a verification email
- [x] Log in (`/login`) - credentials + Google OAuth, with a link to password reset
- [x] Protected `/dashboard` route via middleware
- [x] Dashboard reads real per-workspace `Project` data from Postgres
- [x] Projects: create / edit / delete, plus search, status filters and sorting
- [x] Tasks per project (`/dashboard/projects/[id]`) that can be added, moved between columns and deleted, plus the activity log (`/dashboard/activity`) and team invites (`/dashboard/team`)
- [x] Analytics (`/dashboard/analytics`) - 30-day activity chart, tasks by status, projects by status, most active people, busiest projects
- [x] Email verification + password reset through Resend
- [x] Custom 404 pages, route-level loading skeletons and empty states
- [x] Responsive shell with a mobile navigation drawer
- [x] Rate limiting on login, registration, password reset and verification emails
- [x] Error boundaries (root, dashboard-scoped, and a global fallback)
- [x] Branded favicon, Apple touch icon, Open Graph/Twitter cards, per-page titles, `robots.txt` and `sitemap.xml`
- [x] Security headers (`Strict-Transport-Security`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
- [x] Prisma schema includes `Plan` (FREE/PRO) and Stripe fields, ready for billing

## Email

Transactional email goes through [Resend](https://resend.com).

- If `RESEND_API_KEY` is **not** set, nothing is sent. The app logs a warning instead, and to keep local development usable:
  - the dashboard banner shows the verification link inline for the signed-in owner,
  - password reset links are printed to the server console (outside production only).
- `EMAIL_FROM` must use a domain you have verified in Resend. `Vantra <onboarding@resend.dev>` works for testing.
- Tokens are never stored in plain text: the database keeps a SHA-256 hash of each token.

| Flow | Entry point | Lifetime |
| --- | --- | --- |
| Email verification | sent on `/signup`, consumed at `/verify-email?token=...` | 24 hours, single use |
| Password reset | requested at `/forgot-password`, consumed at `/reset-password?token=...` | 1 hour, single use |
| Workspace invite | sent from `/dashboard/team`, accepted at `/invite/[token]` | 7 days |

`/forgot-password` always returns the same response, so it cannot be used to discover which email addresses have accounts.

## Deploying to Vercel + Neon

1. **Database.** Create a Neon project and copy its pooled connection string, which looks like
   `postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`.

2. **Apply the schema.** From a machine that can reach port 5432:

   ```bash
   npx prisma db push
   ```

   If outbound Postgres (port 5432) is blocked on your network, run the SQL in
   [Adding the token tables](#adding-the-token-tables) in the Neon SQL editor instead.

3. **Deploy.** Either connect a Git repository in the Vercel dashboard, or deploy straight from this folder:

   ```bash
   npx vercel          # preview deployment
   npx vercel --prod   # production deployment
   ```

4. **Set the environment variables** in Vercel (Project -> Settings -> Environment Variables):

   | Variable | Notes |
   | --- | --- |
   | `DATABASE_URL` | Neon pooled connection string |
   | `AUTH_SECRET` | `npx auth secret` |
   | `NEXT_PUBLIC_APP_URL` | Your deployed URL, e.g. `https://vantra.vercel.app` |
   | `RESEND_API_KEY` | From the Resend dashboard (needed for real email) |
   | `EMAIL_FROM` | An address on a domain verified in Resend |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Optional; if set, add `https://your-domain/api/auth/callback/google` as an authorized redirect URI in Google Cloud |

5. **Redeploy** after adding the variables so the build picks them up.

`npm run build` runs `prisma generate` first, which is what Vercel needs to produce the Prisma client during its build.

## Adding the token tables

`npx prisma db push` handles this automatically. When you cannot reach the database directly, run this in the Neon SQL editor:

```sql
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

ALTER TABLE "EmailVerificationToken"
  ADD CONSTRAINT "EmailVerificationToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PasswordResetToken"
  ADD CONSTRAINT "PasswordResetToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Rate limiting table

`src/lib/rate-limit.ts` uses this table to throttle logins, sign-ups, password resets and verification emails. The limiter fails open, so the app keeps working before this table exists - it just runs without rate limiting.

```sql
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimit_expiresAt_idx" ON "RateLimit"("expiresAt");
```

## Next phases

- **Billing**: Stripe subscription checkout + webhook handler, gate features by plan
- **Enforce email verification** if unverified accounts should not have full access
- **Content Security Policy**: intentionally omitted for now, since a strict policy needs auditing against Next.js' inline scripts
- **Export and account deletion**: CSV export of projects/tasks, plus self-serve account deletion
- **Automated tests**: flows are currently verified by hand

## Notes

The Prisma client is generated by `npm run build` (and `npx prisma generate`), so run that first on a fresh clone.