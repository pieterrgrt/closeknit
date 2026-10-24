# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Monorepo with the SvelteKit app (`apps/web`) and the database package (`packages/db`).
- PostgreSQL schema with Drizzle migrations and a `groups` table.
- Tenant isolation with Row Level Security: a restricted app role, a per-transaction group context and a slug lookup that works before any context exists.
- The app refuses to start with a database role that bypasses Row Level Security.
- `/healthz` health check, strict Content Security Policy and security headers.
- Docker image and Docker Compose setup with a one-shot migration service.
- CI: lint, type checks, licence headers, unit, database and end-to-end tests, and a Docker Compose smoke test.
- Production deployment: Caddy build with a DNS plugin for the wildcard certificate, `docker-compose.prod.yml`, `deploy/Caddyfile` and `docs/deploy.md`.
- AGPL-3.0-or-later licence, DCO-based contribution guide and SPDX headers.
