# Database Entities

MVP entities only (see `docs/requirements/mvp-scope.md`). `Notification` and `Announcement` are listed at the end for reference since they're modeled in `PROJECT_SCOPE.md` §27, but are Version 2 — do not create tables for them yet.

Types are written as Java/JPA-ish types; translate to PostgreSQL column types 1:1 (`UUID`, `VARCHAR`, `DATE`, `TIME`, `TIMESTAMP`, `NUMERIC`, `BOOLEAN`, `TEXT`).

---

## User

Base authentication identity. Admin and Coach are 1:1 extensions of User; Parent is also a 1:1 extension (a parent must have a login).

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR, unique | login identifier |
| passwordHash | VARCHAR | BCrypt |
| role | ENUM(ADMIN, COACH, PARENT) | single role per user for v1 |
| firstName | VARCHAR | |
| lastName | VARCHAR | |
| phone | VARCHAR, nullable | |
| status | ENUM(ACTIVE, INACTIVE) | default ACTIVE |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

## Parent

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user | FK → User, unique | 1:1 |
| address | VARCHAR, nullable | |

## Coach

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user | FK → User, unique | 1:1 |
| bio | TEXT, nullable | |

## Player

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| firstName | VARCHAR | |
| lastName | VARCHAR | |
| dateOfBirth | DATE | drives age/group eligibility |
| gender | ENUM(MALE, FEMALE), nullable | |
| photoUrl | VARCHAR, nullable | |
| medicalNotes | TEXT, nullable | minimal collection, §26 |
| emergencyContactName | VARCHAR, nullable | |
| emergencyContactPhone | VARCHAR, nullable | |
| status | ENUM(ACTIVE, ARCHIVED) | default ACTIVE |
| registrationDate | DATE | first registration date |
| parent | FK → Parent | N:1 |
| currentGroup | FK → Group, nullable | N:1, set on registration approval |

Address/phone for the player are intentionally omitted — use the parent's. Add later only if a real need appears (§26: avoid unnecessary sensitive data).

## Season

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR, unique | e.g. "2026-2027" |
| startDate | DATE | |
| endDate | DATE | |
| isActive | BOOLEAN | exactly one season active at a time, enforced in service layer |

## Group

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR | free text — real groups are e.g. "Baby Basket", "Grandes Filles", "Garçons", not strict age bands |
| season | FK → Season | N:1 |
| ageMin | INT | |
| ageMax | INT | |
| capacity | INT | |
| coach | FK → Coach, nullable | N:1 |
| scheduleDay | ENUM(SATURDAY, SUNDAY) | |
| scheduleStartTime | TIME | |
| scheduleEndTime | TIME | |
| status | ENUM(ACTIVE, INACTIVE) | default ACTIVE |

Current player count is derived (`COUNT(Player WHERE currentGroup = this)`), not stored, to avoid drift.

## Registration

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| player | FK → Player | N:1 |
| parent | FK → Parent | N:1, denormalized from player for query convenience |
| season | FK → Season | N:1 |
| requestedGroup | FK → Group | N:1 |
| status | ENUM(PENDING, APPROVED, REJECTED, WAITING_LIST, CANCELLED) | default PENDING |
| registrationDate | TIMESTAMP | submission time |
| reviewedBy | FK → User, nullable | admin who approved/rejected |
| reviewedAt | TIMESTAMP, nullable | |
| notes | TEXT, nullable | |

One row per player per season (unique constraint on `player_id, season_id`) — this is what gives the historical record described in §10.

## TrainingSession

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| group | FK → Group | N:1 |
| coach | FK → Coach | N:1, denormalized from group for query convenience, can differ if substitute |
| date | DATE | |
| startTime | TIME | |
| endTime | TIME | |
| location | VARCHAR, nullable | |
| status | ENUM(SCHEDULED, COMPLETED, CANCELLED) | default SCHEDULED |
| notes | TEXT, nullable | |

## Attendance

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| session | FK → TrainingSession | N:1 |
| player | FK → Player | N:1 |
| status | ENUM(PRESENT, ABSENT, LATE, EXCUSED) | |
| markedBy | FK → User | coach who recorded it |
| markedAt | TIMESTAMP | |
| notes | TEXT, nullable | |

Unique constraint on `session_id, player_id`.

## Payment

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| player | FK → Player | N:1 |
| parent | FK → Parent | N:1, denormalized |
| amount | NUMERIC(10,2) | |
| currency | VARCHAR(3) | default "TND" |
| paymentDate | DATE, nullable | null until actually paid |
| period | VARCHAR | e.g. "2026-09" (billing month) |
| method | ENUM(CASH, BANK_TRANSFER, OTHER), nullable | |
| status | ENUM(PAID, UNPAID, OVERDUE) | |
| reference | VARCHAR, nullable | receipt/transfer ref |
| recordedBy | FK → User | admin who logged it |
| notes | TEXT, nullable | |

Unique constraint on `player_id, period`.

---

## Version 2 entities (not built in MVP)

- **Announcement** — title, content, author (FK User), targetAudience (ALL/PARENTS/COACHES/GROUP), targetGroup (FK Group, nullable), priority, createdAt
- **Notification** — deviceToken, user (FK User), type, payload, sentAt, readAt
