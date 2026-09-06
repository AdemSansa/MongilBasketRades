# Mongil Basket Rades — Academy Management App

Mobile-first application for managing Mongil Basket Rades basketball academy: player registration, groups/seasons, weekend training sessions, attendance, and payments.

See [PROJECT_SCOPE.md](PROJECT_SCOPE.md) for the full scope and architecture, and [docs/ROADMAP.md](docs/ROADMAP.md) for current build status.

## Structure

```text
mobile/    Flutter application
backend/   Spring Boot application
docs/      Architecture, database, API, and requirements docs
```

## Stack

- **Mobile:** Flutter, Dart, Riverpod, Dio, GoRouter
- **Backend:** Java 21, Spring Boot, Spring Security, JWT, Spring Data JPA
- **Database:** PostgreSQL

## Getting started

```bash
cd mobile
flutter run
```

See [backend/README.md](backend/README.md) for backend setup (requires `JWT_SECRET` and a running PostgreSQL instance).
