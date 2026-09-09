# Test Accounts (dev environment only)

Credentials for manually testing each role against the local dev backend
(`http://192.168.100.2:8080`, Docker Postgres). None of these are real
academy credentials — see notes per account.

**This IP changes** whenever the dev machine's Wi-Fi gets a new DHCP
lease (e.g. after sleep/reconnect — this happened once already, on
2026-09-10). If the Flutter app or Angular app suddenly can't reach the
backend, check the machine's current IP (`ipconfig` / PowerShell
`Get-NetIPAddress -AddressFamily IPv4`) before assuming a real bug, and
update it in both `mobile/lib/core/constants/api_constants.dart`
(`baseUrl`) and `admin/src/app/core/config/api-config.ts`
(`API_BASE_URL`) if it's changed.

## Admin (Angular app)

| Email | Password | Notes |
|---|---|---|
| `admin@mongilbasket.test` | `AdminTest2026!` | Pre-existing seed account; password was unknown/lost and reset to this value on 2026-09-08 during testing. Reset again if needed — it's a throwaway dev account, not a real person. |

Use this to log into the Angular admin app (`admin/`, `npm run start`, http://localhost:4200) — Registrations, Sessions, Players/Groups placeholders.

## Coaches (Flutter app)

Real imported coach accounts — real names, but the password is a shared placeholder set during the roster import (see `backend/scripts/import_roster.py`), not each coach's real password.

| Email | Password | Group |
|---|---|---|
| `mme.amira@mongilbasket.academy` | `ImportPending2026!` | Grandes Filles - Mme Amira |
| `mlle.amira@mongilbasket.academy` | `ImportPending2026!` | Grandes Filles - Mlle Amira |
| `fathi@mongilbasket.academy` | `ImportPending2026!` | Garcons - Coach Fathi |
| `ines@mongilbasket.academy` | `ImportPending2026!` | Groupe - Coach Ines |
| `hejer@mongilbasket.academy` | `ImportPending2026!` | Groupe - Coach Hejer |

## Parents (Flutter app)

The 241 imported real parent accounts are synthetic (no real email/password captured in the source spreadsheet) — **they cannot log in**. Use this test account instead:

| Email | Password | Notes |
|---|---|---|
| `testparent@mongilbasket.test` | `TestParent2026!` | Created 2026-09-08 via `POST /api/users` (admin-created, per the parent-account-creation fix that day). Has one child, "ahmed test", approved into Garcons - Coach Fathi. |

To create another test parent (as admin, via curl or the Angular app once a Players/Users screen exists):

```bash
curl -X POST http://192.168.100.2:8080/api/users \
  -H "Authorization: Bearer <admin access token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"someone@example.com","password":"SomePassword123!","firstName":"First","lastName":"Last","phone":"12345678","role":"PARENT"}'
```

## Backend

Requires `JWT_SECRET` to be set before `./mvnw spring-boot:run` — see `backend/README.md`. A restart regenerates the secret unless it's exported persistently, which invalidates existing tokens (not accounts/passwords — those are unaffected).
