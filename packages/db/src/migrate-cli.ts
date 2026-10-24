// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { runMigrations } from './migrate.ts';

const ownerUrl = process.env.DATABASE_OWNER_URL;
if (!ownerUrl) {
	console.error('DATABASE_OWNER_URL is not set');
	process.exit(1);
}

await runMigrations(ownerUrl, process.env.DATABASE_URL);
console.log('Database is up to date.');
