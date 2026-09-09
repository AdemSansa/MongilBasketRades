# Roadmap & Current Status

Tracks real progress against the phases defined in `PROJECT_SCOPE.md` §39. Update this file's checkboxes and "Current Status" block whenever a phase item is actually completed — this is the single source of truth for "where are we," not the phase checklists in PROJECT_SCOPE.md (those stay as the static plan).

For login credentials to manually test each role, see [`docs/testing/test-accounts.md`](testing/test-accounts.md).

---

## Current Status

**Active phase:** Phase 11 — Notifications (next)
**Last updated:** 2026-09-10

**Architecture decision (2026-09-07):** the director/admin surface moves from "future Flutter routes" to a dedicated **Angular web app** (`admin/`, not yet scaffolded), used on PC. Flutter (`mobile/`) now covers **Coach + Parent only**. See `PROJECT_SCOPE.md` §2/§4 and the new "Angular Admin App" section below for what this changes.

**Just completed:**
- Phase 0 environment fully verified — Flutter 3.47.2, Android SDK 36.0.0, Git all confirmed working by actually building and running the default Flutter app on a physical device (M2101K7BNY).
- Phase 1 planning docs: MVP scope, entities, ERD, API spec, navigation.
- Phase 2 Flutter foundation: feature-first `lib/` structure, theme, GoRouter with role-aware redirects, Riverpod, Dio client with JWT-attaching interceptor, secure token storage, reusable widgets, and a working login screen. Theme updated to the real academy brand colors (navy/orange) after reviewing the Facebook page.
- Phase 3 backend foundation: Spring Boot 4.1 project, PostgreSQL (Docker dev container), User entity + JPA, JWT access/refresh tokens, role-based auth (ADMIN/COACH/PARENT), global exception handling with field-level validation errors, `/api/auth/{login,register,refresh,me,logout}` all manually tested with curl. `mvn test` passes.
- **Milestone 1 achieved**: Flutter login connected to the real backend, verified end-to-end on the physical device.
- Phase 4 Players & Parents: `Parent` entity (auto-created on registration) and `Player` entity/CRUD API, with ownership enforced in the service layer (a parent can only see/edit their own children). Flutter side: "My Children" list (loading/error/empty/data states, pull-to-refresh) and an Add Child form, both wired to the real backend and verified live on device — registered a parent, added a child, saw it appear in the list.
- Phase 5 Groups & Seasons: `Season` and `Group` entities/CRUD API, `Coach` entity (mirrors `Parent`), and a minimal admin `/api/users` endpoint to create coach/admin accounts (deferred from Phase 3, now genuinely needed). `Player.currentGroup` added (deferred from Phase 4). All verified end-to-end with curl, including single-active-season enforcement and role boundaries. No new Flutter UI this phase — group/season management is ADMIN-only, which now means Angular, not Flutter.
- Phase 6 Registration: `Registration` entity/workflow (submit → approve/waitlist → reject/cancel), with capacity-aware approval (auto-downgrades to WAITING_LIST when the group is full) and re-registration allowed after a rejection (uniqueness is enforced against active statuses only, not any-status — fixed a real bug found during testing where the DB constraint permanently blocked re-registering after a REJECTED attempt). Flutter: parents can browse groups for the active season and submit a registration per child, with live status shown on the My Children screen. Verified end-to-end on device.
- **Angular admin app scaffolded** (`admin/`, Angular 22, standalone/signals): auth (login, session restore across page reloads via refresh token, route guard), dashboard shell with sidebar nav, and a fully working **Registrations review screen** — filter by status, approve, reject with a required reason. Verified in-browser end-to-end against the real backend. `ng test` (7/7) and `ng build` both pass. Players and Groups pages are placeholders — their backends (Phase 4/5) are ready, screens aren't built yet.
- Phase 7 Sessions & Schedule: `TrainingSession` entity/CRUD API (roster of currently-assigned players included on the detail endpoint, ready for Phase 8 to attach attendance marks), coach-scoped listing, ownership-checked cancel/complete. Flutter: coach dashboard now shows real today's-sessions (§38 weekend mode) with a roster/cancel/complete detail screen. Angular: a minimal Sessions screen (list + create + cancel) — the only way to schedule a session at all, since it's ADMIN-only. Verified end-to-end in-browser (Angular) and via the coach's own API calls (Flutter's device wasn't connected at test time, so that leg was verified at the API level rather than visually on-screen — flagged as a gap below). Hit and fixed a harder version of the recurring Postgres null-parameter bug — this time a null `LocalDate` bound as untyped `bytea`, and `bytea→date` has no cast at all in Postgres (unlike `bytea→text`, which is why the earlier `CAST` fix pattern worked for strings but not here) — switched `TrainingSessionRepository` to Spring Data Specifications, which never bind a parameter for a filter that isn't supplied, avoiding the whole bug class rather than patching another symptom.

- **Real academy data imported** (2026-09-08): the academy's own roster spreadsheet (245 real players) was imported into the dev database via `backend/scripts/import_roster.py` — real names, DOBs where available (196/245 lacked one; those got a clearly-fake placeholder DOB of 2000-01-01 plus a `medicalNotes` flag for admin follow-up, per user decision), and 5 real coach-based groups (Mme Amira, Mlle Amira, Coach Fathi, Coach Ines, Coach Hejer) under the "2026-2027" season, which is now the active season (matches today's real date). This is data only — no schema/architecture changes were made to fit the spreadsheet; columns with no matching entity yet (weight, height, uniform size, insurance, monthly payment tracking) were deliberately not imported since `Payment` doesn't exist until Phase 9. The source spreadsheet itself was never committed to the repo (contains children's personal data).
- Phase 8 Attendance: `Attendance` entity/API — bulk upsert (`POST /api/attendance`, one call marks/re-marks any number of players against a session), single-record correction (`PUT /api/attendance/{id}`), session roster+marks view (`GET /api/attendance/session/{id}`), and a player attendance summary with rate (`GET /api/players/{id}/attendance`, matches the §13 worked example: 17/20 → 85%). Ownership enforced the same way as sessions (a coach can only mark their own sessions' attendance; parents can view their own children's summary only). Flutter: `session_detail_screen.dart` now shows the roster as tap-to-mark chips (Present/Absent/Late/Excused per player, optimistic update with rollback on error) plus an "All present" bulk-fill shortcut for the §38 weekend workflow, and `parent_home_screen.dart` shows a color-coded attendance-rate badge on each approved child.
- **Full on-device verification pass (2026-09-08)**, phone reconnected: walked the whole app step by step — parent registration→approval→group-assignment loop, coach attendance marking, parent attendance badge — all confirmed working live on the physical device and in the real Angular admin UI. Found and fixed two real bugs in the process:
  - **Admin couldn't create parent accounts.** `UserService.createUser()` hard-rejected `role=PARENT` on the assumption that parents only self-register via `/auth/register` — which turned out not to match the academy's actual workflow (the admin/secretary registers parents, same as the 245 imported accounts). Parents now get the same admin-creation path as coaches (`POST /api/users`, auto-creates the linked `Parent` profile); `/auth/register` is left in place as an alternate path, not removed.
  - **Coach dashboard session cards became untappable once a session left SCHEDULED status.** `_SessionCard`'s trailing slot held the only navigation control (a "Roster" button, shown only when `status == SCHEDULED`); completing a session swapped it for a plain status Chip with no `onTap` anywhere on the tile, so there was no way back into a completed session at all — including to review or correct attendance already taken. Fixed by moving navigation onto the `ListTile.onTap` (always active) and making the trailing purely cosmetic.
- **Self-registration was deliberately not built for Flutter** (no `/auth/register` screen) — confirmed as correct, not a gap: parent accounts are admin-created, matching the fix above.
- Found and fixed a third real bug during the same on-device pass: `setState(() => _future = _load())` (three call sites — `session_detail_screen.dart`'s `_completeSession` and its `ErrorView.onRetry`, and `register_child_screen.dart`'s `ErrorView.onRetry`) used an arrow-body closure, and an assignment expression evaluates to its right-hand value — so the closure returned the `Future` `_load()` produced instead of `void`, tripping Flutter's real "setState() callback argument returned a Future" assertion. This was the actual cause of the "error but it still completed" symptom seen earlier when testing Phase 8 — the action itself always succeeded, only the post-action screen refresh crashed. Fixed all three call sites with block-bodied closures; confirmed fixed live on device (marking a session complete no longer throws).
- Phase 9 Payments: `Payment` entity/API — one record per player per billing period (`YYYY-MM`, unique constraint, corrected via PUT rather than duplicated, same reasoning as Attendance), `POST/PUT /api/payments`, `GET /api/payments` (admin, filterable by status/period/playerId via Specifications — applied that fix pattern proactively this time), `GET /api/payments/me` (parent), `GET /api/players/{id}/payments`. Angular: a Payments screen (admin-only) — filter chips, a create form, inline correction. Flutter: a "Payments" button on each approved child opens a per-month payment history list (§14's mockup). All three layers verified end-to-end: curl (duplicate-period 409, validation, ownership 403s), live in-browser (created + corrected a payment in Angular), and live on-device (parent saw both records, including the Angular-side correction, in the Flutter app).

- Phase 10 Dashboard: `GET /api/dashboard/admin` (total/active players, pending registrations, waiting list, active coaches, today's/upcoming session counts + today's session list, unpaid fees, overall attendance rate) and `GET /api/dashboard/parent` (per child: current group, next upcoming session, own attendance rate, latest payment status). Angular: `dashboard-home` replaced its placeholder with a real stat-card grid + today's-sessions table, with Pending Registrations/Unpaid Fees cards linking straight to their review screens. Flutter: a "Next training: Sep 13, 09:00" line added to each approved child's card, the one piece of §17's mockup not already covered by earlier phases (attendance badge and payment status were already there). All verified end-to-end: curl against real data (252 players, 87.5% attendance), live in-browser, and live on-device.
- **Dev machine's LAN IP changed mid-session** (192.168.100.105 → 192.168.100.2, apparently a DHCP lease renewal after the machine slept overnight) — this is what actually caused a genuine "unable to reach the server" on the phone, not an app bug. Updated `ApiConstants.baseUrl` (Flutter) and `API_BASE_URL` (Angular) to match. Worth checking `ipconfig`/`Get-NetIPAddress` first next time both clients suddenly can't connect, before assuming a code regression.

**In progress:** nothing active right now.

**Not started:** Phases 11–12, Deployment. Angular Players/Groups screens.

**Next up:** Phase 11 (Notifications) — per PROJECT_SCOPE §18, though note `docs/api/endpoints.md` explicitly defers `/announcements` and `/notifications` to "Version 2, not built in MVP." Worth confirming with the user whether to actually build this now or treat Phase 12 (Testing) as the real next step and revisit Notifications as a V2 item.

**Known gaps carried forward:**
- Flutter's "My Children" screen doesn't surface a rejection reason — once a registration is REJECTED, `parent_home_screen.dart` correctly treats it as inactive and re-offers the "Register" button (the intended re-registration fix from Phase 6), but the reason itself (visible in Angular's Registrations screen) isn't shown anywhere in the app. Confirmed with the user this is acceptable for now, not a blocker.
- Backend not yet pushed anywhere — local only, same as the mobile repo.
- Refresh-token revocation is stateless-JWT-only for now (no DB-backed revocable store) — a deliberate MVP simplification, noted in `docs/api/endpoints.md` and `AuthController.logout()`.
- A prior backend attempt (Flyway migrations, bigint IDs, a proper revocable `refresh_tokens` table) was found already running against the dev Postgres container but not on disk anywhere in this repo; per user decision it was treated as disposable test data and dropped in favor of the fresh Phase 3 build. If that other implementation resurfaces, reconcile deliberately rather than assuming this one wins.
- Coach-only Flutter player screens (list, search/filter — read-only, own groups) aren't built yet. Coach visibility also still isn't scoped to "their groups" (every coach sees every player in `PlayerService.list()`) — Group now exists so this is no longer blocked, just not done yet; worth fixing whenever the coach player-list screen actually gets built.
- Admin player management (list/search/filter/edit/archive) has no UI at all right now — not a Flutter gap anymore, it's Angular scope. See "Angular Admin App" below.
- `Season.active` uniqueness ("only one active season") is enforced in `SeasonService`, not a DB constraint — matches the original plan in `docs/database/erd.md` ("simpler for v1, revisit if it becomes a real bug source").
- 196 imported players have a placeholder DOB (2000-01-01, flagged in `medicalNotes`) since the source spreadsheet didn't have real ones — the admin/coach screens will need a way to surface/filter these for follow-up once built (e.g. an Angular Players screen sort-by-flagged-notes, or just a manual query for now).
- All 241 imported parent accounts are synthetic (no real parent name/email in the source data, just a generated placeholder) — they can't log in for real; if a parent wants app access, an admin-assisted account-claiming/password-reset flow would need to exist first (not built).

---

## Phase 0 — Environment ✅

- [x] Flutter installed
- [x] Dart installed
- [x] Android Studio installed
- [x] Android SDK installed
- [x] Command-line tools installed
- [x] Android licenses accepted (new Android CLI tooling no longer uses the legacy license-acceptance flow — confirmed non-blocking by a successful real build/install)
- [x] Emulator/device working (verified on physical device, not just emulator)
- [x] `flutter doctor` checked
- [x] Git configured
- [x] GitHub repository created — **⚠️ local repo only, not yet pushed to GitHub**

## Phase 1 — Planning 🔄

- [x] Confirm requirements — `docs/requirements/mvp-scope.md`
- [x] Define roles — `docs/requirements/mvp-scope.md`
- [x] Define entities — `docs/database/entities.md`
- [x] Define database relationships — `docs/database/erd.md`
- [x] Define API endpoints — `docs/api/endpoints.md`
- [ ] Create wireframes — text-based navigation flow done (`docs/architecture/navigation.md`); visual mockups not created (Figma not started, not blocking)
- [x] Define navigation — `docs/architecture/navigation.md`
- [x] Define MVP — `docs/requirements/mvp-scope.md`

## Phase 2 — Flutter Foundation ✅

- [x] Create Flutter project
- [x] Configure app theme — `mobile/lib/app/theme.dart`
- [x] Configure routing — `mobile/lib/app/routes.dart` (GoRouter, role-aware redirect)
- [x] Configure Riverpod — `ProviderScope` in `main.dart`, providers throughout
- [x] Configure Dio — `mobile/lib/core/network/dio_client.dart` (JWT-attaching interceptor)
- [x] Create folder structure (feature-first, §29) — `app/`, `core/`, `features/`, `shared/`
- [x] Create reusable UI components — `mobile/lib/shared/widgets/` (button, text field, loading, error views)
- [x] Create login UI — `mobile/lib/features/auth/login_screen.dart`

Login talks to a stub `AuthRepository` pointed at `POST /auth/login` — it will actually authenticate once Phase 3 builds that endpoint. Placeholder dashboards exist per role so the post-login redirect has somewhere to land.

## Phase 3 — Backend Foundation ✅

- [x] Create Spring Boot project — `backend/`, Spring Boot 4.1.1 / Java 21
- [x] Configure PostgreSQL — Docker dev container `mongil_basket_postgres` (localhost:5434)
- [x] Configure JPA — Hibernate `ddl-auto: update` for MVP simplicity (no Flyway yet)
- [x] Create User entity — `backend/src/main/java/com/mongilbasket/user/User.java`
- [x] Implement authentication — `backend/src/main/java/com/mongilbasket/auth/`
- [x] Implement JWT — `backend/src/main/java/com/mongilbasket/security/JwtService.java` (jjwt, access + refresh tokens)
- [x] Implement roles — `Role` enum (ADMIN/COACH/PARENT), `SecurityConfig` enforces auth on all but login/register/refresh
- [x] Create global exception handling — `backend/src/main/java/com/mongilbasket/common/GlobalExceptionHandler.java`
- [x] Create validation — Jakarta Bean Validation on request DTOs, field-level errors in the response envelope
- [x] Test APIs with Postman — tested via curl instead (equivalent coverage): register, login, me, refresh, logout, plus failure paths (bad credentials, validation errors, duplicate email, missing/invalid/wrong-type tokens)

`/api/users` admin CRUD (listing/creating coach & admin accounts) was intentionally deferred — not needed until Phase 4+ actually requires managing non-self accounts.

## Phase 4 — Players & Parents ✅ (backend + parent UI; coach and admin UI pending)

- [x] Player entity — `backend/src/main/java/com/mongilbasket/player/Player.java`
- [x] Parent entity — `backend/src/main/java/com/mongilbasket/parent/Parent.java`, auto-created on `POST /auth/register`
- [x] CRUD API — `GET/POST /api/players`, `GET/PUT /api/players/{id}`, `PUT /api/players/{id}/archive`, `GET /api/parents/me/children`, `GET /api/parents/{id}`, `PUT /api/parents/me`
- [x] Flutter player screens — parent-facing only: `mobile/lib/features/players/` (list via `parent_home_screen.dart`, `add_child_screen.dart`). Coach-facing read-only screens not built yet (Known gaps above); admin player management is now Angular's job, not Flutter's (see "Angular Admin App" below).
- [x] Parent-child relationship — enforced both in the DB (`Player.parent` FK) and in `PlayerService` ownership checks (403 if a parent requests a child that isn't theirs)
- [x] Search/filter — `GET /players?search=&status=` (admin/coach only, API-level); no UI for it yet on either client

---

## Angular Admin App (Director) — parallel workstream 🔄

Not part of the numbered Phase 0–12 sequence (that sequence is backend + Flutter). Tracked separately because it's a third codebase sharing the same backend, decided on 2026-09-07 — see `PROJECT_SCOPE.md` §2/§4.

**Status:** Live (2026-09-10) — auth, Registrations, Sessions, Payments, and Dashboard are fully working; only Players/Groups remain as placeholders.

- [x] Angular environment setup — Node 24, Angular CLI 22 (already installed)
- [x] Scaffold `admin/` project — Angular 22, standalone components, signals, vitest
- [x] Auth: login screen, JWT storage (access token in memory, refresh token in `sessionStorage` — see `auth.service.ts` for the reasoning), route guard (`core/guards/auth.guard.ts`)
- [x] Admin dashboard shell — sidebar nav (`features/dashboard/dashboard-shell/`)
- [ ] Players management UI (list/search/filter/create/edit/archive) — backend ready since Phase 4, placeholder page exists, not built yet. A minimal read-only `PlayersService` now exists (`core/services/players.service.ts`) purely to feed the Payments screen's player picker — not a start on this item.
- [ ] Groups/Seasons management — backend ready since Phase 5, placeholder page exists, not built yet
- [x] Registrations review (approve/reject/waiting list) — `features/registrations/registrations-list/`, the actual trigger for starting Angular, fully working: status filter chips, approve, reject with a required reason shown inline (not a browser `prompt()`)
- [x] Sessions management — `features/sessions/sessions-list/`: list, create (group dropdown + date/time/location), cancel. Minimal but functional — no edit or "assign substitute coach" UI yet.
- [x] Payments recording — `features/payments/payments-list/`: filter chips, record-payment form, inline correction. Verified live in-browser (2026-09-09).
- [x] Admin dashboard stats — `features/dashboard/dashboard-home/`: stat-card grid + today's-sessions table, real data via `GET /dashboard/admin`. Verified live in-browser (2026-09-10).

---

## Phase 5 — Groups & Seasons ✅ (backend only — admin-only feature, UI is Angular's job)

- [x] Season entity — `backend/src/main/java/com/mongilbasket/season/Season.java`, CRUD + `/activate` (enforces one active season)
- [x] Group entity — `backend/src/main/java/com/mongilbasket/group/Group.java`, CRUD, read open to any authenticated role
- [x] Capacity — `Group.capacity` + derived `currentCount` in `GroupResponse` (active players currently assigned)
- [x] Coach assignment — `Coach` entity (mirrors `Parent`), `Group.coach` FK, minimal admin `POST/GET /api/users` to create coach accounts
- [x] Flutter group management — writes stay ADMIN-only (Angular's job, not Flutter's); read-only group browsing for parents shipped in Phase 6 (`mobile/lib/features/groups/`, used by the registration flow).

## Phase 6 — Registration ✅

- [x] Registration entity — `backend/src/main/java/com/mongilbasket/registration/Registration.java`
- [x] Parent registration form — `mobile/lib/features/registrations/register_child_screen.dart`, browses groups for the active season and submits
- [x] Admin registration list — **not applicable to Flutter**: Angular's job (see below)
- [x] Approve — `PUT /api/registrations/{id}/approve`, sets `Player.currentGroup` unless the group is full
- [x] Reject — `PUT /api/registrations/{id}/reject`, requires a reason
- [x] Waiting list — automatic outcome of approving when the group is at capacity, not a separate action
- [x] Registration status — shown live on the Flutter "My Children" screen (`GET /registrations/me`), with cancel while pending

## Phase 7 — Sessions & Schedule ✅

- [x] TrainingSession entity — `backend/src/main/java/com/mongilbasket/session/TrainingSession.java` (named to avoid confusion with HTTP sessions)
- [x] Create session — `POST /api/sessions` (ADMIN, via the new Angular Sessions screen)
- [x] Assign group — required on create
- [x] Assign coach — defaults to the group's coach, overridable per-session (substitute coach)
- [x] Schedule UI — Angular `features/sessions/sessions-list/` (admin, create/list/cancel) and Flutter coach dashboard (today's sessions, §38 weekend mode)
- [x] Session details — `GET /api/sessions/{id}` includes the group's current roster (Flutter `session_detail_screen.dart`); attendance marks against that roster are Phase 8
- [x] Cancel session — `PUT /api/sessions/{id}/cancel`, ADMIN or the session's own coach; `PUT .../complete` also added (in scope per docs/database/entities.md's SCHEDULED/COMPLETED/CANCELLED status set)

## Phase 8 — Attendance ✅ (backend fully verified; Flutter UI built but not visually verified on-device)

- [x] Attendance entity — `backend/src/main/java/com/mongilbasket/attendance/Attendance.java` (real DB unique constraint on session+player — one mark per player per session has no legitimate exception, unlike Registration's constraint which had to be removed)
- [x] Mark attendance — `POST /api/attendance` (bulk upsert: create or correct any number of marks in one call)
- [x] Attendance history — `GET /api/players/{id}/attendance` (per-record history + totals)
- [x] Attendance percentage — same endpoint, `attendanceRate` field (present/total × 100, rounded to 1 decimal)
- [x] Flutter attendance UI — `session_detail_screen.dart` tap-to-mark chips per roster player + "All present" bulk shortcut (§38 weekend-mode priority); `parent_home_screen.dart` shows a color-coded rate badge per approved child. Verified live on device 2026-09-08/09.

## Phase 9 — Payments ✅

- [x] Payment entity — `backend/src/main/java/com/mongilbasket/payment/Payment.java` (unique constraint on player_id+period, corrected via PUT rather than duplicated)
- [x] Record payment — `POST /api/payments` (ADMIN, 409 on duplicate player+period)
- [x] Payment status — PAID/PARTIAL/UNPAID/OVERDUE, correctable via `PUT /api/payments/{id}`
- [x] Payment history — `GET /api/players/{id}/payments` (ADMIN or owning PARENT), `GET /api/payments/me` (PARENT, all children)
- [x] Admin payment dashboard — Angular `features/payments/payments-list/`: filter chips (All/Unpaid/Overdue/Partial/Paid), record-payment form, inline correction
- [x] Parent payment view — Flutter `features/payments/player_payments_screen.dart`, opened via a "Payments" button on each approved child's card; per-month list matching §14's mockup

## Phase 10 — Dashboard ✅

- [x] Admin stats — `GET /api/dashboard/admin`: total/active players, pending registrations, waiting list, active coaches, today's/upcoming session counts, unpaid fees, overall attendance rate, today's session list
- [x] Coach dashboard — not built as a separate endpoint; Flutter's coach "Today" screen already covers §16 (today's sessions, attendance workflow) directly via `/sessions/today`, so a redundant `/dashboard/coach` wrapping the same data wasn't added
- [x] Parent dashboard — `GET /api/dashboard/parent`: per child, current group, next upcoming session, own attendance rate, latest payment status
- [x] Admin dashboard UI — Angular `features/dashboard/dashboard-home/`: stat-card grid + today's-sessions table, replacing the Phase-0 placeholder
- [x] Parent dashboard UI — Flutter: "Next training" line added to `parent_home_screen.dart`'s child cards (the one §17 element not already covered by the attendance badge and Payments button from Phases 8–9)

## Phase 11 — Notifications ⬜
## Phase 12 — Testing ⬜
## Deployment ⬜

Detailed task lists for phases 4–12 and Deployment are in `PROJECT_SCOPE.md` §39–40 and will be expanded here as each phase becomes active, so this file doesn't drift out of sync with a plan that hasn't started yet.

---

## Milestone tracker (§44)

**Milestone 1** — Flutter login screen → Spring Boot API → JWT → PostgreSQL → authenticated dashboard shell.
Status: ✅ **Done.** Verified live on a physical Android device (M2101K7BNY) on 2026-09-06.
