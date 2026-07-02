# Launch guide — Learning Tracker

**Auth:** Email OTP (Brevo) · **Reminders:** Brevo · **300 emails/day free**

---

## User flow

1. Log in → email → OTP → dashboard (stays signed in)
2. Settings → reminder time + email
3. Daily Goals → bell **ON**
4. Reminder emails at scheduled time

---

## Brevo setup

1. [app.brevo.com](https://app.brevo.com) → **Senders** → verify sender email
2. **SMTP & API** → **API keys** → generate → copy `xkeysib-...` (once)

---

## Render environment (API)

| Variable | Value |
|----------|--------|
| `BREVO_API_KEY` | `xkeysib-...` |
| `EMAIL_FROM` | `Learning Tracker <teja26kt@gmail.com>` |
| `MONGO_URI` | MongoDB Atlas URI |
| `JWT_SECRET` | Random secret |
| `CRON_SECRET` | Random secret |
| `FRONTEND_URL` | `https://learning-tracker-two-xi.vercel.app` |
| `REMINDER_TIMEZONE` | `Asia/Kolkata` |
| `ADMIN_EMAIL` | Your admin email |
| `NODE_ENV` | `production` |
| `PORT` | `5001` |
| `OTP_MOCK` | `false` |

**Health:** `https://learning-tracker-api-hqzm.onrender.com/api/health` → `"emailReady":true,"senderConfigured":true,"cronConfigured":true`

**Do not add:** `RESEND_*`, `MSG91_*`, `GOOGLE_*`, `EMAIL_USER`, `EMAIL_PASS`, `ADMIN_PHONE`

---

## Vercel environment (frontend)

| Variable | Value |
|----------|--------|
| `VITE_API_BASE_URL` | `https://learning-tracker-api-hqzm.onrender.com/api` |

Must be the **full https URL** — not `/api`, not the Vercel site URL.

Optional: `VITE_GA_MEASUREMENT_ID`

**Do not add:** `VITE_GOOGLE_CLIENT_ID`

Redeploy after changes.

---

## cron-job.org (reminders)

Every 5 minutes, GET:

```
https://learning-tracker-api-hqzm.onrender.com/api/cron/reminders?secret=YOUR_CRON_SECRET
```

---

## cron-job.org (monitoring — emails you when something breaks)

Set `ADMIN_EMAIL` on Render (e.g. `teja26kt@gmail.com`). When the API, database, or email setup fails, you get an alert email (max once per 30 minutes per issue type).

**Job 2 — every 10 or 15 minutes, GET:**

```
https://learning-tracker-api-hqzm.onrender.com/api/cron/health-watch?secret=YOUR_CRON_SECRET
```

You also get alerts when:

- Login OTP emails fail (Brevo issue)
- Reminder emails fail to send
- Any API route returns a 500 error

**Deep health check (manual):**

```
https://learning-tracker-api-hqzm.onrender.com/api/health?deep=1
```

Returns `503` with `issues: [...]` if MongoDB, JWT, or email is misconfigured.

---

## Local dev (`server/.env`)

```
BREVO_API_KEY=xkeysib-...
EMAIL_FROM=Learning Tracker <teja26kt@gmail.com>
MONGO_URI=...
JWT_SECRET=...
OTP_MOCK=true
```

---

## Pre-launch test

- [ ] `/api/health` → `emailReady: true`, `senderConfigured: true`, `cronConfigured: true`
- [ ] Login with any email → OTP arrives
- [ ] Settings → reminder time saved → checklist shows **Ready**
- [ ] Goals → bell ON on at least one incomplete goal
- [ ] cron-job.org **reminders** returns **200** every 5 min
- [ ] cron-job.org **health-watch** returns **200** every 10–15 min
- [ ] `ADMIN_EMAIL` set on Render (you receive failure alerts)
- [ ] Test email: `GET /api/cron/sample-reminder?email=YOU&secret=CRON_SECRET`

---

## Reminders not arriving?

All of these must be true:

1. **cron-job.org** is set up and returns HTTP 200 (wakes Render free tier)
2. **Settings** → time saved + **Save** clicked
3. **Daily Goals** → incomplete goal with **bell on**
4. **Settings** → “Daily email reminders” toggle ON
5. Current time is **after** your reminder time (India IST by default)
6. You have not already received today’s email (one per day)

In the app: **Settings → Email reminders** shows a green **Ready** checklist when configured.

**Test send (replace secret and email):**
```
https://learning-tracker-api-hqzm.onrender.com/api/cron/sample-reminder?email=you@gmail.com&secret=YOUR_CRON_SECRET
```

**Dry-run on server:** `node server/scripts/verifyReminders.js`

---

## Unused services (safe to delete accounts)

Resend, MSG91, Google Cloud OAuth — not used by this app anymore.
