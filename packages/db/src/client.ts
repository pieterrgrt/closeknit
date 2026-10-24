// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';

export type Db = PostgresJsDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export interface Database {
	db: Db;
	close: () => Promise<void>;
}

export function createDb(url: string, options: { max?: number } = {}): Database {
	const client = postgres(url, { max: options.max ?? 10, onnotice: () => {} });
	return {
		db: drizzle(client, { schema }),
		close: () => client.end({ timeout: 5 })
	};
}

/**
 * Refuses to run the app as a role that ignores Row Level Security.
 *
 * Superusers and roles with BYPASSRLS skip every policy, which would silently
 * turn off tenant isolation.
 */
export async function assertRlsEnforced(db: Db): Promise<void> {
	const rows = await db.execute<{ rolname: string; rolsuper: boolean; rolbypassrls: boolean }>(
		`select rolname, rolsuper, rolbypassrls from pg_roles where rolname = current_user`
	);
	const role = rows[0];
	if (!role) throw new Error('Could not inspect the current database role');
	if (role.rolsuper || role.rolbypassrls) {
		throw new Error(
			`Database role "${role.rolname}" bypasses Row Level Security. ` +
				'Connect the app with the restricted app role (DATABASE_URL), not the owner.'
		);
	}
}
