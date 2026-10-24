// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { assertRlsEnforced, createDb, type Database } from '@closeknit/db';
import { DATABASE_URL } from '$app/env/private';

let database: Database | undefined;

export function getDb(): Database['db'] {
	if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');
	database ??= createDb(DATABASE_URL);
	return database.db;
}

/** Called once at startup: fail fast if the database is unreachable or misconfigured. */
export async function checkDatabase(): Promise<void> {
	await assertRlsEnforced(getDb());
}
