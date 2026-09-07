# Mongil Basket Rades — Academy Management App

Two client apps sharing one backend for managing Mongil Basket Rades basketball academy: player registration, groups/seasons, weekend training sessions, attendance, and payments.

- **Flutter app** (`mobile/`) — Coach and Parent, mobile-first
- **Angular app** (`admin/`, not yet scaffolded) — Director/Admin, PC/web back office

See [PROJECT_SCOPE.md](PROJECT_SCOPE.md) for the full scope and architecture, and [docs/ROADMAP.md](docs/ROADMAP.md) for current build status.

## Structure

```text
mobile/    Flutter application (Coach + Parent)
admin/     Angular application (Director) — not yet scaffolded
backend/   Spring Boot application
docs/      Architecture, database, API, and requirements docs
```

## Stack

- **Mobile:** Flutter, Dart, Riverpod, Dio, GoRouter
- **Admin web:** Angular (not yet scaffolded)
- **Backend:** Java 21, Spring Boot, Spring Security, JWT, Spring Data JPA
- **Database:** PostgreSQL

## Getting started

```bash
cd mobile
flutter run
```

See [backend/README.md](backend/README.md) for backend setup (requires `JWT_SECRET` and a running PostgreSQL instance).
