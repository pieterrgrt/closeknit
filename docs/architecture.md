# Architecture

This document describes how Closeknit is put together. It grows with each milestone.

## Overview

```
browser ──HTTPS──> Caddy ──> web (SvelteKit, adapter-node) ──> PostgreSQL
                              (wildcard subdomain per group)
```

- **`apps/web`**: one SvelteKit app serves the pages, the API and, from M3, WebSockets for chat. It runs as a plain Node server.
- **`packages/db`**: the Drizzle schema, SQL migrations and helpers for the tenant context. Shared by the app and, later, background workers (pg-boss).
- **PostgreSQL** is the only stateful service: data, sessions, job queue (pg-boss) and realtime fan-out between instances (`LISTEN/NOTIFY`). No Redis.

## Multi-tenancy and Row Level Security

All groups share one database. Every group-bound table has a `group_id` column and a Row Level Security (RLS) policy that only shows rows of the current group.

**Two roles**

| Role                                                 | Used by         | RLS                                   |
| ---------------------------------------------------- | --------------- | ------------------------------------- |
| owner (`DATABASE_OWNER_URL`)                         | migrations only | Bypassed (table owner)                |
| `closeknit_app` group role, login via `DATABASE_URL` | the running app | Enforced; cannot alter or drop tables |

`pnpm db:migrate` applies the migrations as the owner and then creates or updates the login role named in `DATABASE_URL` as a member of `closeknit_app`. At startup the app checks that its role is neither superuser nor `BYPASSRLS`, and refuses to run otherwise.

**Group context per transaction**

```ts
await withContext(db, { groupId, userId }, async (tx) => {
  return tx.select().from(posts); // only this group's posts
});
```

`withContext` opens a transaction and sets `app.group_id` and `app.user_id` with `set_config(..., true)`. Those settings are transaction-local, so they cannot leak to the next request on a pooled connection. Policies read them through `app.current_group_id()` and `app.current_user_id()`. Without a context every group-bound table looks empty.

**Before a context exists**

A request for `marchlewski63.closeknit.eu` first has to find the group. `app.resolve_group_slug(slug)` is a `SECURITY DEFINER` function that returns only the id, never the row.

**What RLS protects against**

RLS is a safety net against bugs: a forgotten `where group_id = …` cannot leak another group's data. It does not replace authorisation in the app: the app decides which group a request may act on (membership, role) and then sets the context. A compromised app process can still set any context.

## Security baseline

- Strict Content Security Policy (`default-src 'self'`, nonces for inline scripts, no external sources) set in `apps/web/vite.config.ts`.
- `nosniff`, `same-origin` referrer and opener policies, and a restrictive `Permissions-Policy` on every response.
- SvelteKit's built-in CSRF origin check for form submissions.
- `robots.txt` disallows indexing; groups are private.

## Licence headers

Every source file carries an SPDX header; `scripts/license-headers.js` checks this in CI. Files without comment syntax are covered by `REUSE.toml`.
