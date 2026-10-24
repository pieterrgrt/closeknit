# Closeknit

A private, beautiful and open-source meeting place for your building, and later for any close-knit group. Hosted in Europe, federated from day one.

Each group gets its own space with a notice board, chat per floor or subgroup, a shared calendar, a lending corner and polls. No ads, no trackers, no data sold.

> **Status:** early development (milestone M0, foundation). Not ready for use yet.

## Principles

- **Private per group.** Groups are invite-only; nothing is public unless a group chooses so.
- **European and sovereign.** Every service in the chain runs under European jurisdiction where that can be avoided otherwise. No US clouds, CDNs, Google Fonts or analytics.
- **Yours to take with you.** Full export per member and per group; run it on your own server.
- **Federated.** Closeknit speaks ActivityPub, so self-hosted buildings can talk to groups on closeknit.eu.
- **Calm.** No like counters, no endless timeline, no gamification.

## Quick start

With Docker:

```sh
docker compose up
```

Then open <http://localhost:3000>, which shows the clickable demo for now. The `migrate` service creates the schema and the restricted database role before the app starts.

For development you need Node.js 22.18 or later, pnpm 10 (`corepack enable`) and PostgreSQL 16 or later:

```sh
pnpm install
docker compose up -d db
cp apps/web/.env.example apps/web/.env
pnpm db:migrate
pnpm dev
```

## Repository layout

| Path          | What                                                          |
| ------------- | ------------------------------------------------------------- |
| `apps/web`    | The SvelteKit app (Svelte 5, TypeScript, `adapter-node`)      |
| `packages/db` | Drizzle schema, migrations and the Row Level Security helpers |
| `docs`        | Architecture notes and design proposals                       |
| `scripts`     | Repository tooling, such as the licence header check          |

## Commands

| Command            | What it does                                                      |
| ------------------ | ----------------------------------------------------------------- |
| `pnpm dev`         | Starts the app in development mode                                |
| `pnpm build`       | Builds every package                                              |
| `pnpm check`       | Type-checks every package                                         |
| `pnpm lint`        | Prettier, ESLint and the licence header check                     |
| `pnpm format`      | Formats the code and adds missing licence headers                 |
| `pnpm test`        | Unit and database tests (database tests need `TEST_DATABASE_URL`) |
| `pnpm test:e2e`    | Playwright end-to-end tests against a built app                   |
| `pnpm db:generate` | Generates a migration from the schema                             |
| `pnpm db:migrate`  | Applies migrations and provisions the app role                    |

## Database roles

The app never connects as the schema owner. `DATABASE_OWNER_URL` runs migrations; `DATABASE_URL` is a restricted role that is subject to Row Level Security, so one group can never see another group's data, even through a bug in a query. The app refuses to start if its role could bypass RLS. See [docs/architecture.md](docs/architecture.md).

## Deploying

Production setup with HTTPS and a wildcard certificate per group on one server: see [docs/deploy.md](docs/deploy.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md); every commit needs a `Signed-off-by` line under the Developer Certificate of Origin.

## Licence

Closeknit is free software under the [GNU Affero General Public License v3.0 or later](LICENSE). If you run a modified version as a service, you must offer its source to your users.

Copyright © 2026 Aldus Lab and Closeknit contributors.
