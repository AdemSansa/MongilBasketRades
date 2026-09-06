# Roadmap & Current Status

Tracks real progress against the phases defined in `PROJECT_SCOPE.md` §39. Update this file's checkboxes and "Current Status" block whenever a phase item is actually completed — this is the single source of truth for "where are we," not the phase checklists in PROJECT_SCOPE.md (those stay as the static plan).

---

## Current Status

**Active phase:** Phase 4 — Players & Parents (next)
**Last updated:** 2026-09-06

**Just completed:**
- Phase 0 environment fully verified — Flutter 3.47.2, Android SDK 36.0.0, Git all confirmed working by actually building and running the default Flutter app on a physical device (M2101K7BNY).
- Phase 1 planning docs: MVP scope, entities, ERD, API spec, navigation.
- Phase 2 Flutter foundation: feature-first `lib/` structure, theme, GoRouter with role-aware redirects, Riverpod, Dio client with JWT-attaching interceptor, secure token storage, reusable widgets, and a working login screen (loading/error/success states) backed by a stub `AuthRepository`. Theme updated to the real academy brand colors (navy/orange) after reviewing the Facebook page.
- Phase 3 backend foundation: Spring Boot 4.1 project, PostgreSQL (Docker dev container), User entity + JPA, JWT access/refresh tokens, role-based auth (ADMIN/COACH/PARENT), global exception handling with field-level validation errors, `/api/auth/{login,register,refresh,me,logout}` all manually tested end-to-end with curl (success paths, validation errors, bad credentials, missing/garbage/wrong-type tokens). `mvn test` passes.

**In progress:** nothing active right now.

**Not started:** Phases 4–12, Deployment.

**Next up:** Phase 4 (Players & Parents) — Milestone 1 is now achievable: point the Flutter login screen at the real backend and confirm the full login → JWT → dashboard flow end-to-end on device.

**Known gaps carried forward:**
- Backend not yet pushed anywhere — local only, same as the mobile repo.
- Refresh-token revocation is stateless-JWT-only for now (no DB-backed revocable store) — a deliberate MVP simplification, noted in `docs/api/endpoints.md` and `AuthController.logout()`.
- A prior backend attempt (Flyway migrations, bigint IDs, a proper revocable `refresh_tokens` table) was found already running against the dev Postgres container but not on disk anywhere in this repo; per user decision it was treated as disposable test data and dropped in favor of the fresh Phase 3 build. If that other implementation resurfaces, reconcile deliberately rather than assuming this one wins.

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

## Phase 4 — Players & Parents ⬜
## Phase 5 — Groups & Seasons ⬜
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
Status: 🔄 Both halves work independently (Flutter UI ✅, backend API ✅ verified via curl) but haven't been connected and run together end-to-end on device yet. That's the very next task.
