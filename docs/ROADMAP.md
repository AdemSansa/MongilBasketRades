# Roadmap & Current Status

Tracks real progress against the phases defined in `PROJECT_SCOPE.md` §39. Update this file's checkboxes and "Current Status" block whenever a phase item is actually completed — this is the single source of truth for "where are we," not the phase checklists in PROJECT_SCOPE.md (those stay as the static plan).

---

## Current Status

**Active phase:** Phase 1 — Planning
**Last updated:** 2026-09-06

**Just completed:**
- Phase 0 environment fully verified — Flutter 3.47.2, Android SDK 36.0.0, Git all confirmed working by actually building and running the default Flutter app on a physical device (M2101K7BNY).
- Repo structure created (`mobile/`, `backend/` pending, `docs/`), git initialized, first commit made.
- Flutter project scaffolded at `mobile/` (package `com.mongilbasket.mobile`).

**In progress:**
- Phase 1 planning docs (this pass): entities, ERD, API spec, navigation, MVP scope lock.

**Not started:** Phases 2–12, Deployment.

**Next up:** Phase 2 (Flutter foundation — theme, routing, Riverpod, Dio, folder structure) and Phase 3 (Backend foundation — Spring Boot project, PostgreSQL, JWT auth) can proceed in either order or in parallel; Milestone 1 (§44) needs both.

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

## Phase 2 — Flutter Foundation ⬜

- [ ] Create Flutter project — done as part of Phase 0 validation, needs revisit for real config
- [ ] Configure app theme
- [ ] Configure routing
- [ ] Configure Riverpod
- [ ] Configure Dio
- [ ] Create folder structure (feature-first, §29)
- [ ] Create reusable UI components
- [ ] Create login UI

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
Status: ⬜ Not started. Requires Phase 2 + Phase 3 both underway.
