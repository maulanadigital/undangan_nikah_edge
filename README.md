# Sakeenah

Modern Islamic wedding invitation platform with multi-tenant architecture.

![Preview](public/preview.png)

```
bun install && cp .env.example .env
# edit .env → bun run dev
docker compose up -d    # or Docker
```

## Features

- **Guest mgmt** — personalized links, attendance tracking, real-time wishes
- **Multi-tenant** — one deployment, unlimited weddings, isolated data
- **UX** — Motion animations, audio, countdown, Google Maps, digital envelope

## Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Runtime | Bun | Package mgmt & server |
| Frontend | React 19 + Vite | UI & build |
| Backend | Hono | Edge API framework |
| Database | Cloudflare D1 (Workers) / PostgreSQL (local) | Multi-tenant storage |
| Styling | Tailwind CSS v4 | Utility-first |
| Animation | Motion | Declarative transitions |
| Deployment | Cloudflare Workers | Global edge |

## Scripts

| Command | Action |
|---------|--------|
| `bun run dev` | Client + server concurrently |
| `bun run dev:client` | Frontend only (Vite) |
| `bun run dev:server` | Backend only (Hono API) |
| `bun run build` | Build frontend to `dist/` |
| `bun run deploy` | Build + deploy to Cloudflare |
| `bun run generate-links` | Generate guest links |
| `bun run lint` | ESLint validation |

## Docs

[Getting Started](https://github.com/sakeenah-wedding/template/wiki/Getting-Started) · [Deployment](https://github.com/sakeenah-wedding/template/wiki/Deployment) · [API](https://github.com/sakeenah-wedding/template/wiki/API-Reference) · [Architecture](https://github.com/sakeenah-wedding/template/wiki/Architecture) · [Structure](https://github.com/sakeenah-wedding/template/wiki/Project-Structure) · [Security](https://github.com/sakeenah-wedding/template/wiki/Security) · [Testing](https://github.com/sakeenah-wedding/template/wiki/Testing) · [Links](https://github.com/sakeenah-wedding/template/wiki/Personalized-Links)

## Cloudflare D1 deployment

1. Authenticate with `bunx wrangler login`, then create a D1 database with
   `bunx wrangler d1 create undangan-jurnalku-db`.
2. Copy `wrangler.jsonc.example` to `wrangler.jsonc` and replace
   `database_id` with the ID returned by Wrangler. The example is set to the
   `undangan-jurnalku` Worker and `undangan.jurnalku.id` custom domain.
3. Apply the schema with
   `bunx wrangler d1 migrations apply undangan-jurnalku-db --remote`.
4. Add invitation, agenda, and bank-account records to D1, then run
   `bun run deploy`.

The D1 migration creates the API tables and indexes; it does not seed wedding
content. Local development can continue to use PostgreSQL via `DATABASE_URL`.

## Admin dashboard

The admin dashboard is available at `/admin`. The first administrator is
restricted to the `ADMIN_USERNAME` configured in Wrangler. Before first use:

1. Apply all D1 migrations, then set a one-time setup secret with
   `bunx wrangler secret put ADMIN_SETUP_TOKEN`. Use a random value of at least
   32 characters and keep it private.
2. Visit `/admin`, enter the configured admin username, the setup secret, and a
   unique password of at least 12 characters.
3. After the account is created, remove the one-time secret with
   `bunx wrangler secret delete ADMIN_SETUP_TOKEN`.

The dashboard supports invitation, agenda and bank-account management,
attendance statistics, wish moderation, and password changes. Admin sessions
use secure HTTP-only cookies; login attempts are rate-limited. Never commit
`wrangler.jsonc` or setup secrets.

For PostgreSQL development, apply
`src/server/db/migrations/002-admin-dashboard.sql` to the existing database and
provide `ADMIN_USERNAME` plus `ADMIN_SETUP_TOKEN` to the local Worker environment.

---

Apache 2.0 · [@mrofisr](https://github.com/mrofisr) · Built with [Vite](https://vite.dev/), [React](https://react.dev/), [Hono](https://hono.dev/) · Animations by [Motion](https://motion.dev/) · Icons by [Lucide](https://lucide.dev/)
