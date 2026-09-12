# Test Accounts

## Live deployment (Render + Neon)

Backend: **https://mongilbasketrades.onrender.com/api**
Free tier — first request after ~15 min idle takes 30-60s to wake up.

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@mongilbasket.test` | `AdminLive2026!` | Created directly via SQL against Neon (bootstrap — no other way to create the first admin). |
| Coach | `mme.amira@mongilbasket.academy` | `ImportPending2026!` | Grandes Filles - Mme Amira |
| Coach | `mlle.amira@mongilbasket.academy` | `ImportPending2026!` | Grandes Filles - Mlle Amira |
| Coach | `fathi@mongilbasket.academy` | `ImportPending2026!` | Garcons - Coach Fathi |
| Coach | `ines@mongilbasket.academy` | `ImportPending2026!` | Groupe - Coach Ines |
| Coach | `hejer@mongilbasket.academy` | `ImportPending2026!` | Groupe - Coach Hejer |
| Parent | `testparent@mongilbasket.test` | `TestParent2026!` | No children yet on this live DB. |

**Data seeded on 2026-09-12:** the real 245-player roster was imported
into Neon too (`backend/scripts/import_roster.py`, pointed at Neon's
connection details — coach/group creation was idempotent and reused
the accounts already created via the API, only players/parents were
newly inserted), under an active "2026-2027" season created via
`POST /api/seasons` + `.../activate`. Two test sessions (2026-09-12,
Grandes Filles - Mme Amira and Garcons - Coach Fathi) each have 10
players marked with a mixed spread of PRESENT/ABSENT/LATE/EXCUSED —
enough to exercise the attendance UI and PDF/Excel exports live, not a
full replica of local dev's test data (no payments seeded live yet).

## Local dev (Docker Postgres)

Credentials for the local dev backend (`http://172.20.10.2:8080` —
this IP changes whenever the dev machine's Wi-Fi gets a new DHCP lease;
check `ipconfig` / `Get-NetIPAddress -AddressFamily IPv4` if it stops
responding, don't assume a real bug). This environment has the full
245-player real roster import, seasons/groups, and this session's test
data (sessions, attendance marks, payments).

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@mongilbasket.test` | `AdminTest2026!` | Pre-existing seed account; password was unknown/lost and reset on 2026-09-08. |
| Coach | `mme.amira@mongilbasket.academy` | `ImportPending2026!` | Grandes Filles - Mme Amira (75 players) |
| Coach | `mlle.amira@mongilbasket.academy` | `ImportPending2026!` | Grandes Filles - Mlle Amira (38 players) |
| Coach | `fathi@mongilbasket.academy` | `ImportPending2026!` | Garcons - Coach Fathi (34 players) |
| Coach | `ines@mongilbasket.academy` | `ImportPending2026!` | Groupe - Coach Ines (47 players) |
| Coach | `hejer@mongilbasket.academy` | `ImportPending2026!` | Groupe - Coach Hejer (50 players) |
| Parent | `testparent@mongilbasket.test` | `TestParent2026!` | Has one child, "ahmed test", approved into Garcons - Coach Fathi. |

To create another test parent (as admin, via curl):

```bash
curl -X POST http://172.20.10.2:8080/api/users \
  -H "Authorization: Bearer <admin access token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"someone@example.com","password":"SomePassword123!","firstName":"First","lastName":"Last","phone":"12345678","role":"PARENT"}'
```

Requires `JWT_SECRET` to be set before `./mvnw spring-boot:run` — see
`backend/README.md`. A restart regenerates the secret unless it's
exported persistently, which invalidates existing local-dev sessions
(not accounts/passwords — those are unaffected).
