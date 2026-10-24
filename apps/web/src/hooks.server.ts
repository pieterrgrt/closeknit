// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { checkDatabase } from '#lib/server/db.js';
import { applySecurityHeaders } from '#lib/server/headers.js';

export const init: ServerInit = async () => {
	if (!building) await checkDatabase();
};

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	applySecurityHeaders(response.headers);
	return response;
};
