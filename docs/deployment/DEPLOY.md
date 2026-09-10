# Deployment (v1.0 live test)

**Current plan: Render.com (backend + admin) + Neon.tech (Postgres).**
Both are free with no credit card required — chosen specifically because
the alternative (a truly "always free" VM like Oracle Cloud) requires
card verification for signup. This path trades that off for two real
costs, both acceptable for a v1.0 pilot:

- **Cold starts**: Render's free web services spin down after ~15
  minutes idle. The first request after a quiet period takes 30-60s to
  wake up; after that it's normal speed until it goes idle again.
- **Split origins, no domain yet**: the backend and admin app live on
  different `*.onrender.com` subdomains (not the same-origin setup a
  single VM would give you), so the browser makes cross-origin requests.
  The backend's CORS is currently wide-open (`SecurityConfig.java`,
  flagged in a comment) to make this work — tighten it to the real
  origin once things stabilize.
- Still **HTTP-adjacent but actually HTTPS**: unlike the raw-IP VM plan,
  Render and Neon both terminate TLS for you automatically on their
  `*.onrender.com` / `*.neon.tech` domains — so this is genuinely more
  secure than the no-domain VM alternative, with zero setup.

When the project is fully built out and a real budget exists, migrate to
a paid, always-on host (a small VPS, or Render's paid tier which removes
the spin-down) — see "Future: VM + Docker Compose path" at the bottom,
which is already fully prepared and just needs a paid VM to run on.

## One-time setup (you do this part — account creation needs your info)

### 1. Database — Neon

1. Sign up at **https://neon.tech** (GitHub/Google login works, no card).
2. Create a project (any name, e.g. `mongil-basket`).
3. In the project dashboard, copy the **connection string** — it looks
   like `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`.
4. From that string, pull out: host, database name, username, password.
   Give these to me (or fill them into Render's env vars yourself per
   step 2 below) — I don't need the raw connection string with the
   password in chat if you'd rather enter it directly into Render.

### 2. Backend — Render Web Service

1. Sign up at **https://render.com** (GitHub login is easiest — it can
   read your repos directly).
2. **New → Web Service**, connect the `MongilBasketRades` GitHub repo
   (already pushed — see below).
3. Root directory: `backend`. Runtime: **Docker** (it'll pick up
   `backend/Dockerfile` automatically).
4. Instance type: **Free**.
5. Environment variables (Render's dashboard, not a committed file):
   - `DB_URL` = `jdbc:postgresql://<neon-host>/<dbname>?sslmode=require`
   - `DB_USERNAME` = from Neon
   - `DB_PASSWORD` = from Neon
   - `JWT_SECRET` = generate with `openssl rand -base64 64`
6. Deploy. Render gives you a URL like
   `https://mongilbasketrades-backend.onrender.com`. Save it — needed
   in step 3.

### 3. Admin — Render Static Site

1. **New → Static Site**, same repo.
2. Root directory: `admin`. Build command: `npm run build`. Publish
   directory: `dist/admin/browser`.
3. Before deploying, update
   `admin/src/environments/environment.prod.ts`'s `apiBaseUrl` to
   `https://<your-backend-url-from-step-2>/api`, commit, and push (or
   set it and redeploy after the backend URL is known — chicken-and-egg
   the first time only).

### 4. Point the Flutter app at the live backend

`mobile/lib/core/constants/api_constants.dart`'s `baseUrl` is still a
LAN dev IP — update it to `https://<your-backend-url>/api` and rebuild
the APK before distributing it for the live test. Manual step, not
automatic.

## Redeploying after a code change

Render auto-deploys on push to the connected branch by default — just
`git push`. No manual redeploy step needed once connected.

## Seeding real data

The 245-player roster import (`backend/scripts/import_roster.py`) was
written for the local dev Postgres. Decide deliberately whether to
re-run an equivalent import against Neon or start genuinely fresh —
don't run it against a real database without re-reading what it does
first (see `backend/README.md`).

## Known limitations of this v1.0 deployment

- Cold starts on the backend after 15 min idle (see above).
- CORS is wide-open (`*`) rather than locked to the real admin origin.
- No automated Postgres backups configured on Neon's free tier — check
  their retention/backup policy before treating this as the system of
  record for real payment data.
- `JWT_SECRET` lives in Render's dashboard env vars, not in git — don't
  lose it; rotating it invalidates every existing session.

---

## Future: VM + Docker Compose path (paid, always-on)

Already fully prepared for when there's a budget for a real VPS —
`docker-compose.yml`, `backend/Dockerfile`, `admin/Dockerfile` +
`admin/nginx.conf` (same-origin reverse proxy, so no CORS/environment
juggling needed) are all in the repo root / respective folders. See
the git history around the commit that added them for the original
step-by-step (Oracle Always Free VM setup, `.env` from `.env.example`,
`docker compose up -d --build`) — the same steps apply to any Ubuntu VM
from any provider once you're ready to pay for one, not just Oracle.
