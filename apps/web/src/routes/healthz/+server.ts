// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { getDb } from '#lib/server/db.js';
import type { RequestHandler } from './$types';

/** Liveness and readiness check for Docker and Caddy. */
export const GET: RequestHandler = async () => {
	try {
		await getDb().execute(sql`select 1`);
		return json({ status: 'ok' }, { headers: { 'cache-control': 'no-store' } });
	} catch {
		return json(
			{ status: 'unavailable' },
			{ status: 503, headers: { 'cache-control': 'no-store' } }
		);
	}
};
