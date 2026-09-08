# Mongil Basket Rades — Admin (Angular)

Web back office for the academy director. See [docs/api/endpoints.md](../docs/api/endpoints.md) for the API this talks to, and [docs/architecture/navigation.md](../docs/architecture/navigation.md) for the planned route structure.

## Prerequisites

- Node.js 24+, npm
- The backend running (see [backend/README.md](../backend/README.md)) — this app has no logic of its own, it's a REST client

## Running locally

```bash
npm install
npm start
```

Opens on `http://localhost:4200` by default. Update `src/app/core/config/api-config.ts` if the backend isn't at the LAN IP currently hardcoded there.

Log in with an ADMIN-role account (e.g. seeded directly in the dev database — there's no self-registration for admins, matching `docs/api/endpoints.md`).

## Testing

```bash
npm test
```

## Notes

- Access token lives in memory only; refresh token lives in `sessionStorage` (cleared when the tab closes), not `localStorage` — see the comment in `auth.service.ts` for why.
- Route guards (`core/guards/auth.guard.ts`) are a UX convenience only. The backend enforces `ADMIN`-only access on every request regardless (`PROJECT_SCOPE.md` §26/§30) — never trust the client.
