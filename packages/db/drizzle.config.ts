// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/schema.ts',
	out: './migrations',
	dialect: 'postgresql',
	dbCredentials: { url: process.env.DATABASE_OWNER_URL ?? '' },
	verbose: true,
	strict: true
});
