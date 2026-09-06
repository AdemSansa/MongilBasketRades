# Navigation — MVP

Role-aware GoRouter tree (§29–30). Text wireframes only for v1 — no Figma files yet; add them under this folder later if the director wants visual mockups before Phase 2 UI work starts.

## Route guard flow

```text
Launch
  ↓
Check stored JWT
  ├── none/expired → /login
  └── valid → decode role
       ├── ADMIN  → /admin/dashboard
       ├── COACH  → /coach/dashboard
       └── PARENT → /parent/home
```

Every route is guarded client-side for UX only; the backend re-checks role/ownership on every request (§26, §30). A parent hitting `/admin/*` by editing the URL gets redirected, and even if they somehow reached the screen, the API calls it makes would 403.

## Shared routes

```text
/login
/profile
```

## Admin (§37)

```text
/admin/dashboard
/admin/players
/admin/players/:id
/admin/players/new
/admin/registrations
/admin/registrations/:id
/admin/groups
/admin/groups/:id
/admin/sessions
/admin/sessions/:id
/admin/attendance/session/:id
/admin/payments
/admin/payments/:id
/admin/profile
```

## Coach (§37)

```text
/coach/dashboard        — "today" weekend view (§38), TAKE ATTENDANCE quick action
/coach/groups           — my groups only
/coach/sessions
/coach/sessions/:id
/coach/attendance/session/:id
/coach/players          — read-only, own groups
/coach/profile
```

## Parent (§37)

```text
/parent/home            — my children summary cards
/parent/children
/parent/children/:id
/parent/children/new
/parent/children/:id/register    — registration form
/parent/schedule
/parent/payments
/parent/attendance/:childId
/parent/profile
```

## Screen priority (§36)

- **Coach:** `/coach/dashboard` → `TAKE ATTENDANCE` must be reachable in one tap from launch on a Saturday/Sunday. This is the single fastest path in the app and should be built/tested first once Phase 8 starts.
- **Parent:** home screen answers, per child, in one screen: next training, registration status, payment status, attendance % (§17 example layout).
- **Admin:** dashboard answers, at a glance: total players, pending registrations, unpaid count, today's sessions (§15 example layout).
