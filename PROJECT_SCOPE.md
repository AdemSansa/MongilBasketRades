# Mongil Basket Rades — Academy Management App

> Project scope and implementation roadmap for the Mongil Basket Rades basketball academy.
>
> **Target:** Mobile-first application for academy administration, coaches, parents, and players.
>
> **Initial stack:** Flutter + Dart, Spring Boot + Java, PostgreSQL, REST API, JWT.
>
> **Development principle:** Build the MVP first, keep the architecture extensible, and add advanced features only after the core workflow is stable.

---

## 1. Project Overview

### 1.1 Academy

**Mongil Basket Rades** is a basketball academy operating mainly on:

- Saturday
- Sunday

The academy trains children and teenagers approximately from **5 to 18 years old**.

The current administration relies heavily on:

- Excel / Google Sheets
- Manual registration
- Manual attendance tracking
- Manual payment tracking
- Manual communication

The application will centralize these operations into one system.

### 1.2 Main Objectives

The application should:

1. Digitize player registration.
2. Centralize player and parent information.
3. Organize players into age/skill groups.
4. Manage weekend training sessions.
5. Track attendance.
6. Track payments and payment status.
7. Allow coaches to manage their sessions.
8. Give the academy director a clear dashboard.
9. Reduce repetitive administrative work.
10. Provide a foundation for future mobile/web expansion.

---

# 2. Product Vision

The application should become the academy's central management platform.

### Main users

| Role | Main responsibility |
|---|---|
| Director / Super Admin | Full academy management |
| Coach | Sessions, attendance, player follow-up |
| Parent | Children, registrations, payments, attendance |
| Player | Optional future role |

The first production version should prioritize:

**Director + Coach + Parent**

---

# 3. Recommended Architecture

```text
                  ┌──────────────────────┐
                  │      Flutter App     │
                  │      Android/iOS     │
                  └──────────┬───────────┘
                             │
                        REST / JSON
                             │
                             ▼
                  ┌──────────────────────┐
                  │    Spring Boot API   │
                  │   Authentication     │
                  │   Business Logic     │
                  │   REST Controllers   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │      PostgreSQL      │
                  │       Database       │
                  └──────────────────────┘

             Future integrations:
             ├── Firebase Cloud Messaging
             ├── File/Image Storage
             ├── Online Payments
             └── Web Admin Dashboard
```

---

# 4. Repository Structure

Recommended root structure:

```text
mongil-basket-rades/
│
├── mobile/
│   └── Flutter application
│
├── backend/
│   └── Spring Boot application
│
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   └── requirements/
│
├── PROJECT_SCOPE.md
├── README.md
└── .gitignore
```

Do not put backend logic inside the Flutter project.

---

# 5. Technology Stack

## Mobile

- Flutter
- Dart
- Riverpod
- Dio
- GoRouter
- JSON serialization
- Secure local storage
- Firebase Cloud Messaging later

## Backend

- Java 21 LTS
- Spring Boot
- Spring Web
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- Bean Validation
- PostgreSQL
- Maven
- Lombok (optional)

## Development

- Android Studio
- VS Code
- Git
- GitHub
- Postman
- Figma
- Docker later

---

# 6. Functional Requirements

## FR-01 — Authentication

Users must be able to:

- Register where appropriate.
- Log in.
- Log out.
- Refresh/renew authentication.
- Reset password.
- View their profile.
- Change password.

Authentication must be role-based.

### Roles

```text
ROLE_ADMIN
ROLE_COACH
ROLE_PARENT
```

Optional future:

```text
ROLE_PLAYER
```

---

# 7. Player Management

The director must be able to:

- Create a player.
- Edit a player.
- View a player.
- Archive a player.
- Search players.
- Filter players.
- Assign a player to a group.
- View player history.

### Player information

Possible fields:

```text
id
firstName
lastName
dateOfBirth
gender
phone
address
photo
medicalNotes
emergencyContact
status
registrationDate
group
parent
```

Avoid collecting unnecessary sensitive information.

---

# 8. Parent Management

A parent account can manage one or multiple children.

Parent capabilities:

- View children.
- Submit registration.
- View registration status.
- View payment status.
- View attendance.
- Receive announcements.
- View training schedule.
- Update allowed profile information.

Relationship:

```text
Parent
   │
   ├── Child 1
   ├── Child 2
   └── Child 3
```

---

# 9. Registration / Inscription System

This is one of the most important modules.

## Registration workflow

```text
Parent opens app
       ↓
Creates account
       ↓
Adds child
       ↓
Completes registration form
       ↓
Chooses group/category
       ↓
Submits registration
       ↓
ADMIN reviews request
       ↓
Approved / Rejected / Waiting List
       ↓
Parent receives notification
```

### Registration statuses

```text
PENDING
APPROVED
REJECTED
WAITING_LIST
CANCELLED
```

### Registration should contain

- Player information
- Parent information
- Requested category/group
- Season
- Registration date
- Status
- Notes
- Optional documents

---

# 10. Seasons

The application should support academy seasons.

Example:

```text
2026-2027
2027-2028
2028-2029
```

A player should have historical registrations.

Example:

```text
Player: Ahmed

2025-2026 → U12
2026-2027 → U13
2027-2028 → U14
```

This prevents old data from being overwritten.

---

# 11. Groups / Categories

The academy needs groups based on age and/or skill.

Example:

```text
U8
U10
U12
U14
U16
U18
```

The exact categories should remain configurable by the director.

Each group should have:

- Name
- Age range
- Capacity
- Coach
- Training schedule
- Active/inactive status
- Current player count

### Capacity

Example:

```text
U12
Capacity: 20
Current: 18
Available: 2
```

If full:

```text
Registration → WAITING_LIST
```

---

# 12. Training Sessions

The director/coach can manage training sessions.

A session contains:

```text
id
group
coach
date
startTime
endTime
location
status
notes
```

Possible statuses:

```text
SCHEDULED
COMPLETED
CANCELLED
```

Since the academy mainly operates on weekends, the UI should prioritize:

```text
Saturday
Sunday
```

---

# 13. Attendance

Attendance is a core feature.

Coach opens a session:

```text
U12
Saturday 10:00
```

Players appear:

```text
☑ Ahmed
☑ Mohamed
☐ Youssef
☑ Ali
```

Possible attendance statuses:

```text
PRESENT
ABSENT
LATE
EXCUSED
```

### Attendance history

For each player:

```text
Sessions: 20
Present: 17
Absent: 2
Late: 1

Attendance rate: 85%
```

---

# 14. Payments

The first version should support payment tracking, not necessarily online payment.

Payment record:

```text
id
player
parent
amount
paymentDate
paymentMethod
period
status
reference
notes
```

Statuses:

```text
PAID
PARTIAL
UNPAID
OVERDUE
```

Methods:

```text
CASH
BANK_TRANSFER
OTHER
```

Future:

```text
ONLINE_PAYMENT
```

### Parent view

```text
September
Status: PAID

October
Status: UNPAID

November
Status: PAID
```

---

# 15. Dashboard

## Admin dashboard

The dashboard should show:

```text
Total Players
Active Players
Pending Registrations
Waiting List
Active Coaches
Today's Sessions
Upcoming Sessions
Unpaid Fees
Attendance Overview
```

Example:

```text
--------------------------------
 MONGIL BASKET RADES
--------------------------------

Players             126
Pending              8
Waiting List         4
Unpaid              12

TODAY

U12   10:00  Coach A
U14   14:00  Coach B
U16   16:00  Coach C
```

---

# 16. Coach Dashboard

Coach should see:

```text
My Groups
Today's Sessions
Upcoming Sessions
Attendance
Players
Announcements
```

Main workflow:

```text
Open session
      ↓
View players
      ↓
Mark attendance
      ↓
Save
      ↓
Attendance statistics updated
```

---

# 17. Parent Dashboard

Parent should see:

```text
My Children
Upcoming Training
Registration Status
Payment Status
Attendance
Announcements
Profile
```

Example:

```text
My Children

Ahmed
U12
Next training:
Saturday 10:00

Attendance:
92%

Payment:
PAID
```

---

# 18. Notifications

Future module using Firebase Cloud Messaging.

Notifications can be sent for:

- Registration approved.
- Registration rejected.
- Training cancelled.
- Schedule changed.
- Payment reminder.
- New announcement.
- Important academy information.

Example:

```text
Training Cancelled

U14 training scheduled for Sunday
has been cancelled.
```

---

# 19. Announcements

Admin can publish announcements.

Announcement:

```text
title
content
createdAt
author
targetAudience
priority
```

Audience:

```text
ALL
PARENTS
COACHES
GROUP
```

---

# 20. Calendar / Schedule

The app should provide:

- Weekly schedule.
- Monthly calendar.
- Group schedule.
- Coach schedule.
- Session details.

Primary focus:

```text
Saturday
Sunday
```

---

# 21. Player Development

This can be added after the MVP.

Coach could track:

```text
Ball Handling
Shooting
Passing
Defense
Speed
Physical Development
Teamwork
Discipline
```

Use simple ratings initially:

```text
1 → Beginner
2 → Developing
3 → Good
4 → Very Good
5 → Excellent
```

Do not overcomplicate this module in version 1.

---

# 22. Search and Filters

Admin should be able to search:

- Player name.
- Parent name.
- Phone.
- Group.
- Registration status.
- Payment status.

Example:

```text
Search: Ahmed

Filters:
[U12] [PAID] [ACTIVE]
```

---

# 23. Reports

Future reporting features:

### Player report

```text
Player
Group
Attendance %
Payment status
Registration history
Development
```

### Financial report

```text
Total expected
Total collected
Outstanding
```

### Attendance report

```text
Group
Total sessions
Average attendance
Players with low attendance
```

---

# 24. Excel Import / Export

Because the academy currently uses Excel/Google Sheets, migration is important.

Admin should eventually be able to:

### Import

```text
Excel → Application
```

### Export

```text
Application → Excel
```

Possible export data:

- Players
- Parents
- Attendance
- Payments
- Registrations
- Groups

This should be added after the core system works.

---

# 25. QR Code / Player ID

Future feature.

Each player receives a unique QR code.

Example:

```text
PLAYER-000123
```

Potential use:

```text
Coach scans QR
       ↓
Player identified
       ↓
Attendance screen
```

This is optional and should not block the MVP.

---

# 26. Security Requirements

Security is important because the application contains children's information.

Implement:

- JWT authentication.
- Password hashing with BCrypt/Argon2.
- Role-based authorization.
- HTTPS in production.
- Input validation.
- Server-side authorization.
- Secure token storage on mobile.
- Proper CORS configuration.
- Rate limiting where appropriate.
- Audit logging for important administrative actions.
- No sensitive data in application logs.
- Database backups.
- Minimal collection of personal data.

Never trust authorization performed only in Flutter.

The backend must enforce permissions.

Example:

```text
Parent → Can see own children
Coach → Can see assigned groups
Admin → Can manage academy
```

---

# 27. Database Model

Initial entities:

```text
User
Parent
Player
Coach
Season
Group
Registration
TrainingSession
Attendance
Payment
Announcement
Notification
```

Possible relationships:

```text
User
 ├── Parent
 └── Coach

Parent
 └── Players

Player
 ├── Registrations
 ├── Attendance
 └── Payments

Season
 └── Registrations

Group
 ├── Players
 ├── Coach
 └── TrainingSessions

TrainingSession
 └── Attendance

Announcement
 └── User
```

---

# 28. Backend Package Structure

Recommended Spring Boot structure:

```text
backend/
└── src/main/java/com/mongilbasket/
    │
    ├── config/
    ├── security/
    ├── auth/
    ├── user/
    ├── parent/
    ├── player/
    ├── coach/
    ├── season/
    ├── group/
    ├── registration/
    ├── session/
    ├── attendance/
    ├── payment/
    ├── announcement/
    ├── notification/
    └── common/
```

For each feature:

```text
player/
├── Player.java
├── PlayerRepository.java
├── PlayerService.java
├── PlayerController.java
├── PlayerDTO.java
└── PlayerMapper.java
```

---

# 29. Flutter Architecture

Recommended feature-first structure:

```text
mobile/
└── lib/
    ├── main.dart
    │
    ├── app/
    │   ├── app.dart
    │   ├── routes.dart
    │   └── theme.dart
    │
    ├── core/
    │   ├── constants/
    │   ├── errors/
    │   ├── network/
    │   ├── storage/
    │   └── utils/
    │
    ├── features/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── players/
    │   ├── registrations/
    │   ├── groups/
    │   ├── sessions/
    │   ├── attendance/
    │   ├── payments/
    │   ├── announcements/
    │   ├── notifications/
    │   └── profile/
    │
    └── shared/
        ├── widgets/
        ├── models/
        └── services/
```

---

# 30. Flutter Navigation

Use role-aware navigation.

Example:

```text
Login
  ↓
Check JWT
  ↓
Check role
  ├── ADMIN  → Admin Dashboard
  ├── COACH  → Coach Dashboard
  └── PARENT → Parent Dashboard
```

Protect routes.

A parent should not be able to navigate to an admin page simply by changing the route.

Again, backend authorization remains mandatory.

---

# 31. API Design

Use REST.

Example:

```text
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh

GET    /api/players
GET    /api/players/{id}
POST   /api/players
PUT    /api/players/{id}
DELETE /api/players/{id}

GET    /api/groups
POST   /api/groups
PUT    /api/groups/{id}

GET    /api/registrations
POST   /api/registrations
PUT    /api/registrations/{id}/approve
PUT    /api/registrations/{id}/reject

GET    /api/sessions
POST   /api/sessions
PUT    /api/sessions/{id}

GET    /api/attendance/session/{id}
POST   /api/attendance

GET    /api/payments
POST   /api/payments

GET    /api/announcements
POST   /api/announcements
```

Use DTOs instead of exposing JPA entities directly.

---

# 32. API Response Convention

Recommended format:

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

For errors:

```json
{
  "success": false,
  "data": null,
  "message": "Player not found"
}
```

Validation errors should identify the problematic fields.

---

# 33. MVP Definition

The first release should contain ONLY the features necessary to operate the academy.

## MVP

### Authentication

- Login
- Logout
- Role-based access

### Players

- CRUD
- Search
- Groups

### Parents

- Parent account
- Children

### Registration

- Submit registration
- Admin review
- Approve/reject
- Waiting list

### Groups

- CRUD
- Capacity
- Coach assignment

### Sessions

- Create session
- View schedule
- Session details

### Attendance

- Mark attendance
- Attendance history

### Payments

- Record payment
- Payment status
- Payment history

### Dashboard

- Basic statistics
- Upcoming sessions
- Pending registrations
- Unpaid payments

---

# 34. Version 2

After MVP:

- Push notifications
- Announcements
- Calendar
- Excel import/export
- PDF reports
- Waiting-list automation
- Player QR code
- Player development
- Better analytics
- Advanced search/filtering

---

# 35. Version 3

Potential advanced features:

- iOS release
- Online payments
- Web admin dashboard
- Tournament management
- Game statistics
- Advanced player development
- Automated reminders
- Parent communication
- Multi-academy support
- AI-assisted analytics

Do NOT build these before the MVP is stable.

---

# 36. UI/UX Principles

The application is used by:

- Academy director
- Coaches
- Parents

Therefore:

### Keep it simple

Avoid complicated screens.

### Mobile first

Important actions should be reachable quickly.

### Coach priority

A coach should be able to mark attendance in seconds.

### Parent priority

A parent should quickly understand:

```text
My child
Next training
Registration
Payment
Attendance
```

### Admin priority

Admin should quickly understand:

```text
How many players?
Who registered?
Who hasn't paid?
What happens this weekend?
```

---

# 37. Suggested Main Navigation

## Admin

```text
Dashboard
Players
Registrations
Groups
Sessions
Attendance
Payments
Announcements
Profile
```

## Coach

```text
Dashboard
My Groups
Sessions
Attendance
Players
Announcements
Profile
```

## Parent

```text
Home
My Children
Schedule
Payments
Attendance
Announcements
Profile
```

---

# 38. Weekend Mode

Because the academy operates primarily on weekends, the app should have a special operational focus.

When a coach opens the application on Saturday/Sunday:

```text
TODAY
──────────────

My sessions

10:00
U12
20 players

14:00
U14
18 players
```

Quick action:

```text
[ TAKE ATTENDANCE ]
```

This should be one of the fastest workflows in the application.

---

# 39. Development Roadmap

## Phase 0 — Environment

- [ ] Flutter installed
- [ ] Dart installed
- [ ] Android Studio installed
- [ ] Android SDK installed
- [ ] Command-line tools installed
- [ ] Android licenses accepted
- [ ] Emulator working
- [ ] `flutter doctor` checked
- [ ] Git configured
- [ ] GitHub repository created

---

## Phase 1 — Planning

- [ ] Confirm requirements
- [ ] Define roles
- [ ] Define entities
- [ ] Define database relationships
- [ ] Define API endpoints
- [ ] Create wireframes
- [ ] Define navigation
- [ ] Define MVP

---

## Phase 2 — Flutter Foundation

- [ ] Create Flutter project
- [ ] Configure app theme
- [ ] Configure routing
- [ ] Configure Riverpod
- [ ] Configure Dio
- [ ] Create folder structure
- [ ] Create reusable UI components
- [ ] Create login UI

---

## Phase 3 — Backend Foundation

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

---

## Phase 4 — Players & Parents

- [ ] Player entity
- [ ] Parent entity
- [ ] CRUD API
- [ ] Flutter player screens
- [ ] Parent-child relationship
- [ ] Search/filter

---

## Phase 5 — Groups & Seasons

- [ ] Season entity
- [ ] Group entity
- [ ] Capacity
- [ ] Coach assignment
- [ ] Flutter group management

---

## Phase 6 — Registration

- [ ] Registration entity
- [ ] Parent registration form
- [ ] Admin registration list
- [ ] Approve
- [ ] Reject
- [ ] Waiting list
- [ ] Registration status

---

## Phase 7 — Sessions & Schedule

- [ ] TrainingSession entity
- [ ] Create session
- [ ] Assign group
- [ ] Assign coach
- [ ] Schedule UI
- [ ] Session details
- [ ] Cancel session

---

## Phase 8 — Attendance

- [ ] Attendance entity
- [ ] Session player list
- [ ] Mark present
- [ ] Mark absent
- [ ] Mark late
- [ ] Mark excused
- [ ] Attendance history
- [ ] Attendance percentage

---

## Phase 9 — Payments

- [ ] Payment entity
- [ ] Record payment
- [ ] Payment status
- [ ] Payment history
- [ ] Admin payment dashboard
- [ ] Parent payment view

---

## Phase 10 — Dashboard

- [ ] Admin dashboard
- [ ] Coach dashboard
- [ ] Parent dashboard
- [ ] Statistics
- [ ] Upcoming sessions
- [ ] Pending registrations
- [ ] Payment alerts

---

## Phase 11 — Notifications

- [ ] Firebase project
- [ ] FCM integration
- [ ] Device token management
- [ ] Registration notifications
- [ ] Schedule notifications
- [ ] Payment reminders
- [ ] Announcements

---

## Phase 12 — Testing

### Backend

- [ ] Unit tests
- [ ] Integration tests
- [ ] Authentication tests
- [ ] Authorization tests
- [ ] Validation tests

### Flutter

- [ ] Widget tests
- [ ] Navigation tests
- [ ] API error handling
- [ ] Offline/error states
- [ ] Different screen sizes

### Manual

Test:

```text
Admin
Coach
Parent
```

with realistic academy data.

---

# 40. Deployment

## Backend

Possible deployment:

```text
Spring Boot
     ↓
Docker
     ↓
Cloud/VPS
     ↓
PostgreSQL
```

## Mobile

Android:

```text
Flutter
   ↓
APK / AAB
   ↓
Google Play
```

iOS can be added later.

## Production requirements

- HTTPS
- Environment variables
- Database backups
- Logging
- Monitoring
- Secure secrets
- Production database
- Proper CORS
- JWT configuration
- Error monitoring

---

# 41. Git Strategy

Use branches:

```text
main
develop
feature/auth
feature/players
feature/registrations
feature/attendance
feature/payments
```

Example:

```bash
git checkout -b feature/attendance
```

Commit examples:

```text
feat: add player CRUD
feat: implement JWT authentication
feat: add attendance management
fix: resolve registration validation
refactor: improve player repository
```

---

# 42. Definition of Done

A feature is NOT finished just because the UI works.

A feature is done when:

- Backend endpoint works.
- Authorization is implemented.
- Validation exists.
- Database persistence works.
- API tested with Postman.
- Flutter UI works.
- Loading state exists.
- Error state exists.
- Success state exists.
- Navigation works.
- Relevant tests exist.
- Git commit is made.

---

# 43. Important Development Rules

## Rule 1

Do not build everything at once.

Build:

```text
Feature
 ↓
Backend
 ↓
Test API
 ↓
Flutter UI
 ↓
Connect
 ↓
Test
```

## Rule 2

Do not duplicate business logic in Flutter.

Business rules belong to the backend.

## Rule 3

Never trust the mobile client.

Every important permission must be checked by Spring Security.

## Rule 4

Avoid premature complexity.

Do not introduce microservices, Kubernetes, complex event systems, or AI before they are actually needed.

## Rule 5

Use realistic data.

Create test data resembling:

```text
100+ players
multiple groups
multiple coaches
multiple parents
multiple sessions
multiple payments
```

---

# 44. First Milestone

The first milestone is NOT the entire application.

### Milestone 1

Get this working:

```text
Flutter App
     ↓
Login Screen
     ↓
Spring Boot API
     ↓
JWT
     ↓
PostgreSQL
     ↓
Authenticated Dashboard
```

After this works, build the player module.

---

# 45. Immediate Next Steps

Before writing business features:

### Environment

```text
[ ] flutter doctor
[ ] Android emulator
[ ] VS Code
[ ] Git
[ ] GitHub
```

### Project

```text
[ ] Create repository
[ ] Create mobile/
[ ] Create backend/
[ ] Create docs/
```

### Flutter

```text
[ ] Create Flutter project
[ ] Run default app
[ ] Configure architecture
[ ] Configure Riverpod
[ ] Configure Dio
[ ] Configure GoRouter
```

### Backend

```text
[ ] Create Spring Boot project
[ ] Configure PostgreSQL
[ ] Run backend
[ ] Test health endpoint
```

---

# 46. Recommended First Commands

From the repository root:

```bash
flutter create mobile
```

Then:

```bash
cd mobile
flutter run
```

Backend should be created separately using Spring Initializr / IntelliJ / VS Code.

---

# 47. Success Criteria

The project is successful when the academy can replace most of its manual Excel/Google Sheets workflow with the application.

A parent should be able to:

```text
Create account
   ↓
Add child
   ↓
Register child
   ↓
See status
   ↓
See schedule
   ↓
See attendance
   ↓
See payments
```

A coach should be able to:

```text
Open today's session
   ↓
See players
   ↓
Mark attendance
   ↓
Save
```

The director should be able to:

```text
See dashboard
   ↓
Manage players
   ↓
Approve registrations
   ↓
Manage groups
   ↓
Manage sessions
   ↓
Track attendance
   ↓
Track payments
```

That is the core product.

---

# 48. Final Product Evolution

```text
                    MONGIL BASKET RADES
                           │
                           ▼
                  Mobile Management App
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
        Admin            Coach            Parent
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                    Spring Boot API
                           │
                           ▼
                       PostgreSQL
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
          Firebase      Storage      Payments
          (future)      (future)       (future)
                           │
                           ▼
                 Web Admin Dashboard
                       (future)
```

---

## Current Project Status

**Phase:** Environment setup

**Next task:**

1. Finish Android command-line tools.
2. Accept Android licenses.
3. Confirm `flutter doctor`.
4. Create the GitHub repository.
5. Create the project structure.
6. Create the Flutter application.
7. Run it on the Android emulator.
8. Begin the authentication module.

Do not start advanced features until the foundation is stable.

---

## Project Principle

> **Build a simple system that the academy can actually use before building an impressive system that is difficult to maintain.**
