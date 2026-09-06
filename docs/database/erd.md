# Entity Relationship Diagram — MVP

Field-level definitions live in `entities.md`. This is the relationship map.

```mermaid
erDiagram
    USER ||--o| PARENT : "extends"
    USER ||--o| COACH : "extends"
    PARENT ||--o{ PLAYER : "has children"
    PARENT ||--o{ REGISTRATION : submits
    PARENT ||--o{ PAYMENT : "pays for"
    COACH ||--o{ GROUP : "assigned to"
    COACH ||--o{ TRAININGSESSION : runs
    SEASON ||--o{ GROUP : contains
    SEASON ||--o{ REGISTRATION : "for season"
    GROUP ||--o{ PLAYER : "current group"
    GROUP ||--o{ REGISTRATION : "requested group"
    GROUP ||--o{ TRAININGSESSION : schedules
    PLAYER ||--o{ REGISTRATION : "registration history"
    PLAYER ||--o{ ATTENDANCE : "attendance history"
    PLAYER ||--o{ PAYMENT : "payment history"
    TRAININGSESSION ||--o{ ATTENDANCE : "roll call"
    USER ||--o{ REGISTRATION : reviews
    USER ||--o{ ATTENDANCE : marks
    USER ||--o{ PAYMENT : records

    USER {
        UUID id PK
        string email UK
        string passwordHash
        enum role
        string firstName
        string lastName
        enum status
    }
    PARENT {
        UUID id PK
        UUID user_id FK
        string address
    }
    COACH {
        UUID id PK
        UUID user_id FK
        string bio
    }
    PLAYER {
        UUID id PK
        string firstName
        string lastName
        date dateOfBirth
        enum status
        UUID parent_id FK
        UUID currentGroup_id FK
    }
    SEASON {
        UUID id PK
        string name UK
        date startDate
        date endDate
        boolean isActive
    }
    GROUP {
        UUID id PK
        string name
        UUID season_id FK
        int capacity
        UUID coach_id FK
        enum scheduleDay
    }
    REGISTRATION {
        UUID id PK
        UUID player_id FK
        UUID parent_id FK
        UUID season_id FK
        UUID requestedGroup_id FK
        enum status
        UUID reviewedBy_id FK
    }
    TRAININGSESSION {
        UUID id PK
        UUID group_id FK
        UUID coach_id FK
        date date
        enum status
    }
    ATTENDANCE {
        UUID id PK
        UUID session_id FK
        UUID player_id FK
        enum status
        UUID markedBy_id FK
    }
    PAYMENT {
        UUID id PK
        UUID player_id FK
        UUID parent_id FK
        numeric amount
        enum status
        UUID recordedBy_id FK
    }
```

## Key constraints

- `registration(player_id, season_id)` — unique. One registration row per player per season → historical trail (§10).
- `attendance(session_id, player_id)` — unique. One attendance mark per player per session.
- `payment(player_id, period)` — unique. One payment record per player per billing period.
- `season.isActive` — only one row true at a time, enforced in `SeasonService`, not a DB constraint (simpler for v1, revisit if it becomes a real bug source).
- `player.currentGroup_id` is set/cleared by the registration approval workflow — never edited directly by an admin CRUD form, to keep it consistent with registration history.

## Cascade / delete rules

Nothing in this schema is hard-deleted from the app (§7: players are archived, not deleted; §26 wants audit history preserved). FK deletes should be `RESTRICT` by default; only `Attendance`/`Registration`/`Payment` rows may cascade if their parent `TrainingSession`/`Player` is removed by an admin — and in practice the app never exposes a hard delete for `Player`, `Group`, or `Season` in the MVP, only archive/deactivate flags.
