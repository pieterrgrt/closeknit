// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Database schema.
 *
 * Multi-tenancy: one database, and every group-bound table carries a `group_id`.
 * Isolation is enforced by Postgres Row Level Security. The app connects as a
 * role that is subject to RLS and sets the current group per transaction with
 * `withContext()`; see `context.ts` and `docs/architecture.md`.
 *
 * M0 only contains `groups`, the anchor for every tenant. The full data model is
 * proposed in `docs/data-model.md` and lands in later milestones.
 */

import { sql } from 'drizzle-orm';
import { pgPolicy, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const groups = pgTable(
	'groups',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		slug: text('slug').notNull().unique(),
		name: text('name').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		pgPolicy('groups_isolation', {
			for: 'all',
			using: sql`${t.id} = app.current_group_id()`,
			withCheck: sql`${t.id} = app.current_group_id()`
		})
	]
).enableRLS();
