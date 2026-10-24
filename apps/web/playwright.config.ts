// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineConfig } from '@playwright/test';

const port = 4173;

export default defineConfig({
	testDir: 'e2e',
	webServer: {
		command: 'pnpm build && node --env-file-if-exists=.env build',
		port,
		env: { PORT: String(port), ORIGIN: `http://localhost:${port}` },
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: `http://localhost:${port}`,
		launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined }
	}
});
