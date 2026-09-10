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
| Parent | `testparent@mongilbasket.test` | `TestParent2026!` | No children yet on this live DB — it's a fresh Neon database, not a copy of local dev data. |

**Note:** the live database is currently empty of the local dev roster
(245 imported players, seasons, groups, sessions, attendance, payments)
— only the accounts above exist. Decide deliberately whether to import
the real roster here too (see `backend/scripts/import_roster.py`,
pointed at Neon's connection details) or seed it manually through the
admin app now that Groups/Seasons can be created via the UI.

## Local dev (Docker Postgres)

Credentials for the local dev backend (`http://192.168.100.2:8080` —
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
curl -X POST http://192.168.100.2:8080/api/users \
  -H "Authorization: Bearer <admin access token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"someone@example.com","password":"SomePassword123!","firstName":"First","lastName":"Last","phone":"12345678","role":"PARENT"}'
```

Requires `JWT_SECRET` to be set before `./mvnw spring-boot:run` — see
`backend/README.md`. A restart regenerates the secret unless it's
exported persistently, which invalidates existing local-dev sessions
(not accounts/passwords — those are unaffected).
