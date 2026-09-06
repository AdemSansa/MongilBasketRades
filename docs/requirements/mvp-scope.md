# MVP Scope — Phase 1 Confirmation

Confirms and locks the MVP boundaries from `PROJECT_SCOPE.md` §33 before any backend/mobile code is written for feature modules. Anything not listed here is Version 2/3 and must not be built early (Rule 4, §43).

## Roles in scope

```text
ROLE_ADMIN   — Director / Super Admin, full academy management
ROLE_COACH   — Sessions, attendance, player follow-up (own groups only)
ROLE_PARENT  — Own children only: registration, payments, attendance, schedule
```

`ROLE_PLAYER` is explicitly out of scope for v1.

## In scope (MVP)

| Module | Included |
|---|---|
| Auth | Login, logout, JWT refresh, role-based access. **Not included:** self-service password reset (v2), public admin registration UI (admin accounts seeded manually) |
| Players | CRUD, search, archive, assign to group |
| Parents | Account, linked children, view-only on registration/payment/attendance status |
| Registration | Submit, admin review, approve/reject, waiting list, status tracking |
| Seasons | CRUD, one active season at a time |
| Groups | CRUD, capacity, coach assignment, schedule (day/time) |
| Sessions | Create, view schedule, cancel, mark completed |
| Attendance | Mark present/absent/late/excused per session, history, attendance % |
| Payments | Record payment (cash/bank transfer/other), status, history — **no online payment gateway** |
| Dashboard | Basic stats per role (players, pending registrations, unpaid, today's/upcoming sessions) |

## Explicitly out of scope for v1 (Version 2/3, §34–35)

- Push notifications / Firebase Cloud Messaging
- Announcements module
- Calendar UI (weekly/monthly views) — MVP uses a simple list of upcoming sessions
- Excel import/export
- PDF reports
- Automatic waiting-list promotion
- QR code / player ID
- Player development ratings
- Online payments
- Web admin dashboard
- iOS build
- Multi-academy support

## Definition of Done applies per module (§42)

Backend endpoint → authorization → validation → persistence → Postman-tested → Flutter UI (loading/error/success states) → navigation wired → tests → commit. A module is not "done" on UI completion alone.

## Build order (Rule 1, §43)

```text
Phase 3  Auth (backend) → Milestone 1 (login → JWT → dashboard shell)
Phase 4  Players & Parents
Phase 5  Groups & Seasons
Phase 6  Registration
Phase 7  Sessions & Schedule
Phase 8  Attendance
Phase 9  Payments
Phase 10 Dashboards (admin/coach/parent, now that data exists to show)
```

Groups/Seasons come before Registration because a registration needs a group to request. Sessions come after Groups because a session belongs to a group. Attendance comes after Sessions because it's scoped to a session. Payments is independent of the above chain and could be reordered if needed, but stays after Players/Parents since it references both.
