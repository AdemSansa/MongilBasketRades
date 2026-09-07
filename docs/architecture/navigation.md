# Navigation — MVP

Two separate client apps, each with its own routing — Flutter (Coach + Parent) and Angular (Admin, PC/web). See PROJECT_SCOPE.md §2/§4 for why the split. Text wireframes only for v1 — no Figma files yet; add them under this folder later if the director wants visual mockups before UI work starts on either app.

## Flutter — route guard flow

```text
Launch
  ↓
Check stored JWT
  ├── none/expired → /login
  └── valid → decode role
       ├── COACH  → /coach/dashboard
       └── PARENT → /parent/home
```

An ADMIN credential isn't a supported login on the Flutter app — that's the Angular app's job. Every Flutter route is still guarded client-side for UX only; the backend re-checks role/ownership on every request (§26, §30). A parent hitting `/coach/*` by editing the URL gets redirected, and even if they somehow reached the screen, the API calls it makes would 403.

## Flutter — shared routes

```text
/login
/profile
```

## Flutter — Coach (§37)

```text
/coach/dashboard        — "today" weekend view (§38), TAKE ATTENDANCE quick action
/coach/groups           — my groups only
/coach/sessions
/coach/sessions/:id
/coach/attendance/session/:id
/coach/players          — read-only, own groups
/coach/profile
```

## Flutter — Parent (§37)

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

## Angular — Admin (§37)

Route structure not yet scaffolded (no Angular project exists yet). Planned top-level sections, mirroring the API surface:

```text
/dashboard
/players
/players/:id
/players/new
/registrations
/registrations/:id
/groups
/groups/:id
/sessions
/sessions/:id
/attendance/session/:id
/payments
/payments/:id
/profile
```

Angular Router's route guards play the same client-side-only-UX role that GoRouter's redirect does on Flutter — the backend is still the real gate. Login is separate from the Flutter app's; a PARENT or COACH credential isn't a supported login here.

## Screen priority (§36)

- **Coach (Flutter):** `/coach/dashboard` → `TAKE ATTENDANCE` must be reachable in one tap from launch on a Saturday/Sunday. This is the single fastest path in the app and should be built/tested first once Phase 8 starts.
- **Parent (Flutter):** home screen answers, per child, in one screen: next training, registration status, payment status, attendance % (§17 example layout).
- **Admin (Angular):** dashboard answers, at a glance: total players, pending registrations, unpaid count, today's sessions (§15 example layout).
