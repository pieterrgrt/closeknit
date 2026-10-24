// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test, type Page } from '@playwright/test';

const pages = [
	'/demo',
	'/demo/prikbord',
	'/demo/chat',
	'/demo/chat/3e',
	'/demo/agenda',
	'/demo/uitleen',
	'/demo/inloggen'
];

/** Collects console errors, which is where the browser reports CSP violations. */
function watchErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text());
	});
	page.on('pageerror', (e) => errors.push(e.message));
	return errors;
}

for (const path of pages) {
	test(`${path} renders without errors or CSP violations`, async ({ page }) => {
		const errors = watchErrors(page);
		await page.goto(path);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
		expect(errors).toEqual([]);
	});
}

test('the self-hosted font loads', async ({ page }) => {
	await page.goto('/demo');
	await page.evaluate(() => document.fonts.ready);
	const loaded = await page.evaluate(() =>
		[...document.fonts].some((f) => f.family.includes('Instrument Sans') && f.status === 'loaded')
	);
	expect(loaded).toBe(true);
});

test('voting shows the results', async ({ page }) => {
	await page.goto('/demo');
	await page.getByLabel('Ja, met een code').check();
	await page.getByRole('button', { name: 'Stemmen' }).click();
	await expect(page.getByText('jouw stem')).toBeVisible();
	await expect(page.getByText('17 stemmen')).toBeVisible();
});

test('signing up for an event', async ({ page }) => {
	await page.goto('/demo/agenda');
	const event = page.getByRole('article').filter({ hasText: 'Schoonmaakdag' });
	await event.getByRole('button', { name: 'Ik kom' }).click();
	await expect(event.getByRole('button', { name: 'Afmelden' })).toBeVisible();
	await expect(event.getByText(/^Jij en /)).toBeVisible();
});

test('a chat message appears and survives navigation', async ({ page }) => {
	await page.goto('/demo/chat/3e');
	await page.getByLabel('Bericht aan 3e verdieping').fill('Ik breng de pan morgen terug.');
	await page.getByRole('button', { name: 'Versturen' }).click();
	await expect(page.getByText('Ik breng de pan morgen terug.')).toBeVisible();

	await page.getByRole('link', { name: 'Alle kanalen' }).click();
	await expect(page.getByText('Jij: Ik breng de pan morgen terug.')).toBeVisible();
});

test('posting on the notice board', async ({ page }) => {
	await page.goto('/demo/prikbord');
	await page.getByRole('button', { name: 'Schrijf iets voor je buren…' }).click();
	await page.getByPlaceholder('Waar gaat het over?').fill('Wie wil er mee naar de markt?');
	await page.getByRole('button', { name: 'Plaatsen' }).click();
	await expect(page.getByRole('heading', { name: 'Wie wil er mee naar de markt?' })).toBeVisible();
});

test('the accent and theme can be changed and are remembered', async ({ page }) => {
	await page.goto('/demo');
	await page.locator('label[data-swatch="pruim"]').click();
	await page.getByLabel('Thema').selectOption('dark');
	await expect(page.locator('html')).toHaveAttribute('data-accent', 'pruim');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-accent', 'pruim');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('mobile shows the tab bar, desktop the sidebar', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/demo');
	const tabs = page.locator('nav.tabs');
	await expect(tabs).toBeVisible();
	await tabs.getByRole('link', { name: 'Prikbord' }).click();
	await expect(page).toHaveURL(/\/demo\/prikbord$/);

	await page.setViewportSize({ width: 1280, height: 860 });
	await expect(tabs).toBeHidden();
	await expect(page.locator('aside.side')).toBeVisible();
});

test('an unknown chat channel is a 404', async ({ request }) => {
	const response = await request.get('/demo/chat/bestaat-niet');
	expect(response.status()).toBe(404);
});
