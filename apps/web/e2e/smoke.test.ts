// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test } from '@playwright/test';

test('the home page renders', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Closeknit');
});

test('the health check reaches the database', async ({ request }) => {
	const response = await request.get('/healthz');
	expect(response.status()).toBe(200);
	expect(await response.json()).toEqual({ status: 'ok' });
});

test('pages only allow resources from our own origin', async ({ request }) => {
	const response = await request.get('/');
	const csp = response.headers()['content-security-policy'] ?? '';
	expect(csp).toContain("default-src 'self'");
	expect(csp).toContain("frame-ancestors 'none'");
	expect(csp).not.toMatch(/https?:/);
	expect(response.headers()['x-content-type-options']).toBe('nosniff');
});
