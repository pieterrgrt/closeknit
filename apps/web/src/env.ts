// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_URL: {
		description:
			'Connection string for the restricted app role, which is subject to Row Level Security.',
		// Optional so `vite build` works without a database; db.ts insists on it at startup.
		schema: (value) => value || undefined
	}
});
