# API Endpoints — MVP

Base path: `/api`. All responses use the envelope from `PROJECT_SCOPE.md` §32 (`{ success, data, message }`). All endpoints except `/auth/login` and `/auth/refresh` require `Authorization: Bearer <JWT>`. Authorization column is enforced server-side in Spring Security — never trust the client (§26, Rule 3).

One API, two client apps (§2, §4): the Flutter app (Coach + Parent) and the Angular admin app (Director) are both just REST clients over this same backend. The Role column below is what actually gates access — it doesn't matter which app makes the call.

## Auth

| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/auth/login` | public | email + password → JWT + refresh token |
| POST | `/auth/refresh` | public (valid refresh token) | new access token |
| POST | `/auth/logout` | authenticated | invalidate refresh token |
| GET | `/auth/me` | authenticated | current user profile |
| PUT | `/auth/me/password` | authenticated | change own password |

No self-service registration endpoint in MVP — admin/coach accounts are seeded by the director; parent accounts are created via `/auth/register` restricted to role PARENT only.

| POST | `/auth/register` | public | creates a PARENT user only |

## Users (admin-managed)

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/users` | ADMIN | list, filter by role |
| GET | `/users/{id}` | ADMIN | |
| POST | `/users` | ADMIN | create COACH or ADMIN account |
| PUT | `/users/{id}` | ADMIN | |
| PUT | `/users/{id}/status` | ADMIN | activate/deactivate |

## Players

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/players` | ADMIN, COACH | COACH sees only players in their groups; query params: `search`, `groupId`, `status` |
| GET | `/players/{id}` | ADMIN, COACH, PARENT | PARENT only if `player.parent == self` |
| POST | `/players` | ADMIN, PARENT | PARENT creates their own child (status starts unassigned, no group until registration approved) |
| PUT | `/players/{id}` | ADMIN, PARENT (own child, limited fields) | |
| PUT | `/players/{id}/archive` | ADMIN | soft delete |
| GET | `/players/{id}/attendance` | ADMIN, COACH, PARENT (own) | history + percentage |
| GET | `/players/{id}/payments` | ADMIN, PARENT (own) | history |
| GET | `/players/{id}/registrations` | ADMIN, PARENT (own) | full season history |

## Parents

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/parents/me/children` | PARENT | own children only |
| GET | `/parents/{id}` | ADMIN | |
| PUT | `/parents/me` | PARENT | update own allowed fields (§8) |

## Seasons

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/seasons` | authenticated | |
| POST | `/seasons` | ADMIN | |
| PUT | `/seasons/{id}` | ADMIN | |
| PUT | `/seasons/{id}/activate` | ADMIN | deactivates the currently active season |

## Groups

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/groups` | authenticated | filter by `seasonId`, `status`; COACH sees all (read-only) for context |
| GET | `/groups/{id}` | authenticated | includes derived `currentCount` |
| POST | `/groups` | ADMIN | |
| PUT | `/groups/{id}` | ADMIN | including coach (re)assignment |
| PUT | `/groups/{id}/status` | ADMIN | activate/deactivate |

## Registrations

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/registrations` | ADMIN | filter by `status`, `seasonId`, `groupId` |
| GET | `/registrations/me` | PARENT | own submitted registrations |
| GET | `/registrations/{id}` | ADMIN, PARENT (own) | |
| POST | `/registrations` | PARENT | submits for own child + active season |
| PUT | `/registrations/{id}/approve` | ADMIN | sets player.currentGroup, or WAITING_LIST if group is at capacity |
| PUT | `/registrations/{id}/reject` | ADMIN | requires `notes` |
| PUT | `/registrations/{id}/cancel` | PARENT (own), ADMIN | before review only |

## Sessions

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/sessions` | authenticated | filter by `groupId`, `coachId`, `date`/`dateRange`; COACH defaults to own groups |
| GET | `/sessions/today` | ADMIN, COACH | weekend-mode quick view (§38) |
| GET | `/sessions/{id}` | authenticated | includes roster for attendance |
| POST | `/sessions` | ADMIN | |
| PUT | `/sessions/{id}` | ADMIN, COACH (own group) | |
| PUT | `/sessions/{id}/cancel` | ADMIN, COACH (own group) | |
| PUT | `/sessions/{id}/complete` | ADMIN, COACH (own group) | |

## Attendance

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/attendance/session/{sessionId}` | ADMIN, COACH (own) | roster + current marks |
| POST | `/attendance` | COACH (own session), ADMIN | bulk upsert: `[{ playerId, status }]` for a session |
| PUT | `/attendance/{id}` | COACH (own session), ADMIN | correct a single mark |

## Payments

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/payments` | ADMIN | filter by `status`, `period`, `playerId` |
| GET | `/payments/me` | PARENT | own children's payments |
| POST | `/payments` | ADMIN | record a payment |
| PUT | `/payments/{id}` | ADMIN | correct/update status |

## Dashboard

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/dashboard/admin` | ADMIN | totals: players, pending, waiting list, unpaid, today's/upcoming sessions (§15) |
| GET | `/dashboard/coach` | COACH | own groups, today's/upcoming sessions (§16) |
| GET | `/dashboard/parent` | PARENT | children summary: next training, attendance %, payment status (§17) |

## Reports

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/reports/monthly-attendance` | ADMIN | `?coachId=&year=&month=` (coachId optional — omit for every active group). Per-group grid: each session that month, each active player's mark, present/total rate. Backs the Angular Players screen's PDF export — built ahead of the original Version 2 timeline per a direct admin-workflow request (2026-09-10), not part of the Phase 1 plan. |

## Deferred to Version 2 (not built in MVP)

`/announcements`, `/notifications`, `/import`, `/export`, `/players/{id}/qr`. (`/reports/*` was deferred here originally but `monthly-attendance` shipped early — see above.)
