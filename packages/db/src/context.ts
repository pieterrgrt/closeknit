// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { sql } from 'drizzle-orm';
import type { Db, Tx } from './client.ts';

export interface RequestContext {
	/** The group (tenant) whose rows this transaction may see. */
	groupId?: string | null;
	/** The signed-in user, for policies that depend on who is asking. */
	userId?: string | null;
}

/**
 * Runs `fn` in a transaction scoped to a group and user.
 *
 * The settings are transaction-local (`set_config(..., true)`), so they can never
 * leak to another request that reuses the same pooled connection. Without a group
 * every group-bound table looks empty.
 */
export async function withContext<T>(
	db: Db,
	context: RequestContext,
	fn: (tx: Tx) => Promise<T>
): Promise<T> {
	return db.transaction(async (tx) => {
		await tx.execute(
			sql`select set_config('app.group_id', ${context.groupId ?? ''}, true),
				set_config('app.user_id', ${context.userId ?? ''}, true)`
		);
		return fn(tx);
	});
}

/** Finds a group id by its slug (subdomain) before any group context exists. */
export async function resolveGroupSlug(db: Db, slug: string): Promise<string | null> {
	const rows = await db.execute<{ id: string | null }>(
		sql`select app.resolve_group_slug(${slug}) as id`
	);
	return rows[0]?.id ?? null;
}
