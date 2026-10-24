// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineConfig } from 'vitest/config';

// Locally the database tests are skipped without a database; in CI that would hide them.
if (process.env.CI && !process.env.TEST_DATABASE_URL) {
	throw new Error('TEST_DATABASE_URL must be set in CI');
}

export default defineConfig({
	test: {
		include: ['test/**/*.test.ts'],
		expect: { requireAssertions: true },
		// The tests share one database.
		fileParallelism: false
	}
});
