# Roadmap & Current Status

Tracks real progress against the phases defined in `PROJECT_SCOPE.md` §39. Update this file's checkboxes and "Current Status" block whenever a phase item is actually completed — this is the single source of truth for "where are we," not the phase checklists in PROJECT_SCOPE.md (those stay as the static plan).

---

## Current Status

**Active phase:** Phase 3 — Backend Foundation (next)
**Last updated:** 2026-09-06

**Just completed:**
- Phase 0 environment fully verified — Flutter 3.47.2, Android SDK 36.0.0, Git all confirmed working by actually building and running the default Flutter app on a physical device (M2101K7BNY).
- Phase 1 planning docs: MVP scope, entities, ERD, API spec, navigation.
- Phase 2 Flutter foundation: feature-first `lib/` structure, theme, GoRouter with role-aware redirects, Riverpod, Dio client with JWT-attaching interceptor, secure token storage, reusable widgets, and a working login screen (loading/error/success states) backed by a stub `AuthRepository` pointed at the not-yet-built backend. `flutter analyze` clean, widget test passing, verified running on a physical device.

**In progress:** nothing active right now.

**Not started:** Phases 3–12, Deployment.

**Next up:** Phase 3 (Spring Boot backend + PostgreSQL + JWT) so the login screen has a real API to call — that unlocks Milestone 1.

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

## Phase 3 — Backend Foundation ⬜

- [ ] Create Spring Boot project
- [ ] Configure PostgreSQL
- [ ] Configure JPA
- [ ] Create User entity
- [ ] Implement authentication
- [ ] Implement JWT
- [ ] Implement roles
- [ ] Create global exception handling
- [ ] Create validation
- [ ] Test APIs with Postman

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
Status: 🔄 Half done. Flutter side ready and waiting (Phase 2 ✅); Spring Boot side not started (Phase 3 ⬜).
