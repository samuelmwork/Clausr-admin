# Clausr Admin Portal — Complete Setup Guide

## What this is

A separate Next.js application (runs on port 3001) that gives you full admin control over every aspect of Clausr. It connects to the same Supabase project as the main app using the service role key — meaning it has unrestricted read/write access to all tables.

**Keep this URL secret. Never share it publicly.**

---

## Pages

| Page | URL | What it does |
|------|-----|-------------|
| Dashboard | /dashboard | Live KPIs, signup/email charts, plan distribution, failed alerts |
| Analytics | /analytics | 30-day signups, emails, revenue, MRR/ARR breakdown |
| Organisations | /organisations | Every org — search, filter, manage, upgrade plans |
| Database | /database | Live table viewer for all 7 tables + SQL runner |
| Alerts & Email | /alerts | Failed deliveries, cron history, manual trigger |
| System | /system | Feature flags, announcements, infra health, danger zone |

---

## Quickstart

### 1. Install dependencies

```bash
cd clausr-admin
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
# Same Supabase project as your main Clausr app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # ← the powerful key — keep private!

# Set a strong random password (you'll type this to log in)
ADMIN_PASSWORD=your-very-strong-password-at-least-20-chars

# Generate with: openssl rand -base64 32
ADMIN_SESSION_SECRET=your-32-char-session-secret-here

NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_MAIN_APP_URL=https://clausr.com

# Same CRON_SECRET as your main app
CRON_SECRET=your-cron-secret-here
```

### 3. Run in development

```bash
npm run dev
```

Open http://localhost:3001 → enter your ADMIN_PASSWORD → you're in.

---

## Deploy to Vercel (separate deployment)

### 1. Push to a PRIVATE GitHub repository

```bash
git init
git add .
git commit -m "Clausr admin portal"
git remote add origin https://github.com/your-org/clausr-admin-PRIVATE.git
git push -u origin main
```

**The repo MUST be private.**

### 2. Create a new Vercel project

- Go to vercel.com → New Project → Import your private repo
- Framework: Next.js
- Root directory: `.` (root)
- Add all env variables from `.env.local`
- Deploy

### 3. Set a secret URL

After deploying, you get a URL like `clausr-admin-xyz.vercel.app`.

**Option A** — Use this URL as-is (keep it secret)

**Option B** — Set a custom domain like `admin-internal.clausr.com`:
- Vercel → Settings → Domains → Add domain
- Add DNS records at your registrar

### 4. Add Vercel password protection (recommended)

In Vercel → Project → Settings → Deployment Protection → Enable "Vercel Authentication" or "Password Protection". This adds a second layer on top of the admin portal's own password.

---

## Organisation Management

### Assigning a plan without payment

1. Go to **Organisations**
2. Find the org → click **Manage →**
3. In the drawer, click the plan you want (Free / Starter / Pro / Team)
4. Optionally override the contract limit
5. Click **Save plan changes**

This directly updates the `organisations` table — no Razorpay charge, no webhook needed.

### Extending a trial

In the org drawer, click +7d, +14d, or +30d to extend their access.

### Impersonating a user

Click **Login as org admin** in the org drawer. This is a placeholder in the MVP — for real impersonation you'd generate a magic link via Supabase Auth admin API:

```typescript
const { data } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: userEmail,
})
// Redirect to data.properties.action_link
```

---

## Database Explorer

The Database page shows the latest 20 rows from each table. The SQL Runner lets you run SELECT queries.

**Supported:** Any `SELECT ... FROM table_name ...`
**Blocked:** DROP, TRUNCATE, ALTER TABLE, DELETE FROM organisations, DELETE FROM members

To run a complex query, go directly to Supabase Studio → SQL Editor for full access.

### Useful quick queries (paste into SQL Runner)

```sql
-- Revenue summary
SELECT plan, COUNT(*) as orgs, COUNT(*) * 
  CASE plan WHEN 'starter' THEN 799 WHEN 'pro' THEN 1999 WHEN 'team' THEN 4999 ELSE 0 END as mrr
FROM organisations GROUP BY plan;

-- Orgs near contract limit
SELECT name, plan, contract_limit,
  (SELECT COUNT(*) FROM contracts c WHERE c.org_id = o.id AND c.status != 'cancelled') as used
FROM organisations o ORDER BY (used::float / contract_limit) DESC LIMIT 10;

-- Alert health this week
SELECT DATE(scheduled_for) as day, COUNT(*) FILTER (WHERE sent) as sent,
  COUNT(*) FILTER (WHERE NOT sent) as failed
FROM alerts WHERE scheduled_for >= NOW() - INTERVAL '7 days'
GROUP BY day ORDER BY day;

-- Most active orgs
SELECT o.name, o.plan, COUNT(c.id) as contracts
FROM organisations o LEFT JOIN contracts c ON c.org_id = o.id
GROUP BY o.id, o.name, o.plan ORDER BY contracts DESC LIMIT 20;
```

---

## System Settings Table (optional)

To persist feature flags and announcements, add this table to your Supabase project:

```sql
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "service role only" ON system_settings
  USING (false) WITH CHECK (false);
```

Without this table, feature flags and announcements are in-memory only (reset on deploy). With it, they persist.

---

## Security notes

1. **Service role key** — Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client/browser. It's only used in server-side API routes.
2. **Admin password** — Use at least 20 random characters. Store it in a password manager.
3. **Session cookie** — `clausr_admin_session` is httpOnly, secure (in production), and expires in 7 days.
4. **No public exposure** — This app should never be indexed by Google. The `<meta name="robots" content="noindex">` tag is set in layout.tsx.
5. **Separate deployment** — Running on a different domain/URL from clausr.com means a breach of one doesn't automatically compromise the other.

---

## Design system

- **Font**: DM Sans (body) + Syne (headings/display) + JetBrains Mono (code/labels)
- **Background**: #0d1117 (deep midnight) → #161b25 → #1e2535 surface hierarchy
- **Accent**: Crimson red #dc2626 — sidebar active states, primary buttons, alerts
- **Success**: Jade green #22c55e
- **Charts**: Recharts with custom dark theme
- **Icons**: Lucide React

---

Built for Clausr internal use only. Do not distribute.
