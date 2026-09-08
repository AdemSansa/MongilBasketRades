# Mongil Basket Rades — Backend

Spring Boot 4 / Java 21 REST API. See [docs/api/endpoints.md](../docs/api/endpoints.md) for the full endpoint spec and [docs/database/entities.md](../docs/database/entities.md) for the data model.

## Prerequisites

- Java 21
- A running PostgreSQL instance. Local dev uses the `mongil_basket_postgres` Docker container:
  ```bash
  docker start mongil_basket_postgres   # if not already running
  ```
  It exposes `localhost:5434`, database `mongil_basket`, user `mongil_basket`. These are already the defaults in `application.yml` — no env vars needed for local dev against this container.

## Running locally

The app refuses to start without `JWT_SECRET` (no default — see `application.yml`). Generate one and export it:

```bash
export JWT_SECRET=$(openssl rand -base64 64)
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
$env:JWT_SECRET = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
.\mvnw.cmd spring-boot:run
```

Server starts on `http://localhost:8080`, API base path `/api`.

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `JWT_SECRET` | Yes | none | HMAC signing key for JWTs. Must be long/random — `openssl rand -base64 64` |
| `DB_URL` | No | `jdbc:postgresql://localhost:5434/mongil_basket` | Override for non-local environments |
| `DB_USERNAME` | No | `mongil_basket` | |
| `DB_PASSWORD` | No | `mongil_basket_dev` | Dev-only default; override in every other environment |

## Testing

```bash
./mvnw test
```

Requires the same Postgres connection as `spring.datasource.*` (see `src/test/resources/application.yml`) — no in-memory DB substitution yet, kept simple for the MVP per PROJECT_SCOPE.md Rule 4.

## Real data import

`scripts/import_roster.py` bulk-imports the academy's real roster from its Excel export directly into the database (not through the REST API — appropriate for a one-time historical migration). See the script's docstring for usage and the decisions it makes about incomplete rows. **Not idempotent for players/parents** — re-running duplicates them. The source spreadsheet itself is never committed (contains children's names/phone numbers/addresses).

## Notes on framework version

Scaffolded against **Spring Boot 4.1.1 / Spring Security 7** (current at scaffold time, September 2026) — noticeably newer than most existing tutorials/Stack Overflow answers, which target Boot 3.x. A few APIs moved package between major versions (e.g. `UsernamePasswordAuthenticationFilter` is now under `org.springframework.security.web.authentication`, not `...security.authentication`) — keep that in mind when consulting older references.
