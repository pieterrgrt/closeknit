// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Applies migrations as the owner role, then makes sure the restricted app role
 * from DATABASE_URL exists and can log in.
 *
 *   DATABASE_OWNER_URL  owns the schema; used only here
 *   DATABASE_URL        what the app connects with; subject to RLS
 */

import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

/** The NOLOGIN role that carries the app's privileges; created by migration 0000. */
export const APP_GROUP_ROLE = 'closeknit_app';

export const migrationsFolder = fileURLToPath(new URL('../migrations', import.meta.url));

export async function runMigrations(ownerUrl: string, appUrl?: string): Promise<void> {
	const client = postgres(ownerUrl, { max: 1, onnotice: () => {} });
	try {
		await migrate(drizzle(client), { migrationsFolder });
		if (appUrl) await ensureAppLogin(client, appUrl);
	} finally {
		await client.end({ timeout: 5 });
	}
}

async function ensureAppLogin(client: postgres.Sql, appUrl: string): Promise<void> {
	const { username, password } = new URL(appUrl);
	const user = decodeURIComponent(username);
	if (!user || !password) throw new Error('DATABASE_URL must include a user name and password');

	const [owner] = await client<{ user: string }[]>`select current_user as user`;
	if (owner?.user === user) {
		throw new Error('DATABASE_URL must use a different role than DATABASE_OWNER_URL');
	}

	const [existing] = await client`select 1 from pg_roles where rolname = ${user}`;
	const verb = existing ? 'alter' : 'create';
	// format() quotes the identifier and literal; DDL cannot take bind parameters.
	const [statement] = await client<{ ddl: string }[]>`
		select format(${`${verb} role %I with login nosuperuser nobypassrls password %L`}, ${user}::text, ${decodeURIComponent(password)}::text) as ddl`;
	await client.unsafe(statement!.ddl);
	await client.unsafe(`grant ${APP_GROUP_ROLE} to "${user.replaceAll('"', '""')}"`);
}
