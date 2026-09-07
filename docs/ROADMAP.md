# Roadmap & Current Status

Tracks real progress against the phases defined in `PROJECT_SCOPE.md` §39. Update this file's checkboxes and "Current Status" block whenever a phase item is actually completed — this is the single source of truth for "where are we," not the phase checklists in PROJECT_SCOPE.md (those stay as the static plan).

---

## Current Status

**Active phase:** Phase 6 — Registration (next)
**Last updated:** 2026-09-07

**Architecture decision (2026-09-07):** the director/admin surface moves from "future Flutter routes" to a dedicated **Angular web app** (`admin/`, not yet scaffolded), used on PC. Flutter (`mobile/`) now covers **Coach + Parent only**. See `PROJECT_SCOPE.md` §2/§4 and the new "Angular Admin App" section below for what this changes.

**Just completed:**
- Phase 0 environment fully verified — Flutter 3.47.2, Android SDK 36.0.0, Git all confirmed working by actually building and running the default Flutter app on a physical device (M2101K7BNY).
- Phase 1 planning docs: MVP scope, entities, ERD, API spec, navigation.
- Phase 2 Flutter foundation: feature-first `lib/` structure, theme, GoRouter with role-aware redirects, Riverpod, Dio client with JWT-attaching interceptor, secure token storage, reusable widgets, and a working login screen. Theme updated to the real academy brand colors (navy/orange) after reviewing the Facebook page.
- Phase 3 backend foundation: Spring Boot 4.1 project, PostgreSQL (Docker dev container), User entity + JPA, JWT access/refresh tokens, role-based auth (ADMIN/COACH/PARENT), global exception handling with field-level validation errors, `/api/auth/{login,register,refresh,me,logout}` all manually tested with curl. `mvn test` passes.
- **Milestone 1 achieved**: Flutter login connected to the real backend, verified end-to-end on the physical device.
- Phase 4 Players & Parents: `Parent` entity (auto-created on registration) and `Player` entity/CRUD API, with ownership enforced in the service layer (a parent can only see/edit their own children). Flutter side: "My Children" list (loading/error/empty/data states, pull-to-refresh) and an Add Child form, both wired to the real backend and verified live on device — registered a parent, added a child, saw it appear in the list.
- Phase 5 Groups & Seasons: `Season` and `Group` entities/CRUD API, `Coach` entity (mirrors `Parent`), and a minimal admin `/api/users` endpoint to create coach/admin accounts (deferred from Phase 3, now genuinely needed). `Player.currentGroup` added (deferred from Phase 4). All verified end-to-end with curl, including single-active-season enforcement and role boundaries. No new Flutter UI this phase — group/season management is ADMIN-only, which now means Angular, not Flutter.

**In progress:** nothing active right now.

**Not started:** Phases 6–12, Deployment.

**Next up:** Phase 6 (Registration) — the last backend/Flutter phase before scaffolding Angular (per the decision below).

**Known gaps carried forward:**
- Backend not yet pushed anywhere — local only, same as the mobile repo.
- Refresh-token revocation is stateless-JWT-only for now (no DB-backed revocable store) — a deliberate MVP simplification, noted in `docs/api/endpoints.md` and `AuthController.logout()`.
- A prior backend attempt (Flyway migrations, bigint IDs, a proper revocable `refresh_tokens` table) was found already running against the dev Postgres container but not on disk anywhere in this repo; per user decision it was treated as disposable test data and dropped in favor of the fresh Phase 3 build. If that other implementation resurfaces, reconcile deliberately rather than assuming this one wins.
- Coach-only Flutter player screens (list, search/filter — read-only, own groups) aren't built yet. Coach visibility also still isn't scoped to "their groups" (every coach sees every player in `PlayerService.list()`) — Group now exists so this is no longer blocked, just not done yet; worth fixing whenever the coach player-list screen actually gets built.
- Admin player management (list/search/filter/edit/archive) has no UI at all right now — not a Flutter gap anymore, it's Angular scope. See "Angular Admin App" below.
- `Season.active` uniqueness ("only one active season") is enforced in `SeasonService`, not a DB constraint — matches the original plan in `docs/database/erd.md` ("simpler for v1, revisit if it becomes a real bug source").

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

## Angular Admin App (Director) — parallel workstream ⬜

Not part of the numbered Phase 0–12 sequence (that sequence is backend + Flutter). Tracked separately because it's a third codebase sharing the same backend, decided on 2026-09-07 — see `PROJECT_SCOPE.md` §2/§4.

**Status:** Not started — no `admin/` directory exists yet.

- [ ] Angular environment setup (Node, Angular CLI)
- [ ] Scaffold `admin/` project
- [ ] Auth: login screen, JWT storage (browser-appropriate — not naive localStorage for the access token), route guards
- [ ] Admin dashboard shell
- [ ] Players management UI (list/search/filter/create/edit/archive) — **backend already ready**, built in Phase 4
- [ ] Groups/Seasons management — **backend already ready**, built in Phase 5
- [ ] Registrations review (approve/reject/waiting list) — needs Phase 6 backend first
- [ ] Sessions management — needs Phase 7 backend first
- [ ] Payments recording — needs Phase 9 backend first
- [ ] Admin dashboard stats — needs Phase 10 backend endpoints

**When to start:** decided 2026-09-07 — deferred. Continuing Flutter + backend momentum through Phase 5 and Phase 6 first; scaffold Angular once Phase 6 (Registration) lands, since that's the point an admin UI becomes genuinely necessary (approving registrations by hand via curl doesn't scale).

---

## Phase 5 — Groups & Seasons ✅ (backend only — admin-only feature, UI is Angular's job)

- [x] Season entity — `backend/src/main/java/com/mongilbasket/season/Season.java`, CRUD + `/activate` (enforces one active season)
- [x] Group entity — `backend/src/main/java/com/mongilbasket/group/Group.java`, CRUD, read open to any authenticated role
- [x] Capacity — `Group.capacity` + derived `currentCount` in `GroupResponse` (active players currently assigned)
- [x] Coach assignment — `Coach` entity (mirrors `Parent`), `Group.coach` FK, minimal admin `POST/GET /api/users` to create coach accounts
- [ ] Flutter group management — **not applicable**: group/season writes are ADMIN-only, and admin UI is Angular now (see below), not Flutter. Flutter's role here (read-only group lists for registration/session UI) comes in Phase 6/7 when there's an actual coach/parent-facing feature that needs it.

## Phase 6 — Registration ⬜
## Phase 7 — Sessions & Schedule ⬜
## Phase 8 — Attendance ⬜
## Phase 9 — Payments ⬜
## Phase 10 — Dashboard ⬜
## Phase 11 — Notifications ⬜
## Phase 12 — Testing ⬜
## Deployment ⬜

Detailed task lists for phases 4–12 and Deployment are in `PROJECT_SCOPE.md` §39–40 and will be expanded here as each phase becomes active, so this file doesn't drift out of sync with a plan that hasn't started yet.

---

## Milestone tracker (§44)

**Milestone 1** — Flutter login screen → Spring Boot API → JWT → PostgreSQL → authenticated dashboard shell.
Status: ✅ **Done.** Verified live on a physical Android device (M2101K7BNY) on 2026-09-06.
