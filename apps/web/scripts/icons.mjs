// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Generates the site icons in static/ from the Closeknit mark: favicon.svg,
 * favicon.ico (16, 32, 48), apple-touch-icon.png (180) and icon-192/512.png.
 * Run after changing the mark: `node scripts/icons.mjs` (uses Playwright's Chromium).
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const MARK =
	'M410 245 C470 140 560 25 660 25 C760 25 815 180 810 380 C805 620 680 935 490 935 C370 935 315 800 300 680 C285 560 280 480 260 400 C240 320 215 295 185 295 C120 295 25 430 25 580 C25 670 45 690 70 690 C120 690 200 590 255 470 C290 395 320 330 320 235';
const GREEN = '#2f6b55';
const HEADER = `<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
`;

/**
 * White mark on a green tile. The mark is drawn in a 1000-unit square; small
 * icons get a thicker stroke so the loop stays readable.
 * @param {{ rounded: boolean, stroke: number }} o
 */
function tile({ rounded, stroke }) {
	const r = rounded ? 220 : 0;
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">` +
		`<rect width="1000" height="1000" rx="${r}" fill="${GREEN}"/>` +
		`<g transform="translate(205 160) scale(0.7)">` +
		`<path d="${MARK}" fill="none" stroke="#fff" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>` +
		`</g></svg>`
	);
}

const out = (name) => fileURLToPath(new URL(`../static/${name}`, import.meta.url));

const browser = await chromium.launch({
	executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined
});
const page = await browser.newPage();

/** @param {string} svg @param {number} size */
async function png(svg, size) {
	await page.setViewportSize({ width: size, height: size });
	await page.setContent(
		`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`
	);
	return page.screenshot({ omitBackground: true });
}

/** An ICO file that embeds PNG images, which every current browser reads. */
function ico(images) {
	const header = Buffer.alloc(6 + 16 * images.length);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(images.length, 4);
	let offset = header.length;
	images.forEach(({ size, data }, i) => {
		const e = 6 + 16 * i;
		header.writeUInt8(size >= 256 ? 0 : size, e);
		header.writeUInt8(size >= 256 ? 0 : size, e + 1);
		header.writeUInt8(0, e + 2);
		header.writeUInt8(0, e + 3);
		header.writeUInt16LE(1, e + 4);
		header.writeUInt16LE(32, e + 6);
		header.writeUInt32LE(data.length, e + 8);
		header.writeUInt32LE(offset, e + 12);
		offset += data.length;
	});
	return Buffer.concat([header, ...images.map((i) => i.data)]);
}

writeFileSync(out('favicon.svg'), HEADER + tile({ rounded: true, stroke: 120 }) + '\n');

const small = [];
for (const size of [16, 32, 48]) {
	small.push({
		size,
		data: await png(tile({ rounded: true, stroke: size <= 16 ? 170 : 140 }), size)
	});
}
writeFileSync(out('favicon.ico'), ico(small));

// iOS rounds the corners itself and wants no transparency.
writeFileSync(out('apple-touch-icon.png'), await png(tile({ rounded: false, stroke: 90 }), 180));
writeFileSync(out('icon-192.png'), await png(tile({ rounded: true, stroke: 100 }), 192));
writeFileSync(out('icon-512.png'), await png(tile({ rounded: true, stroke: 90 }), 512));

await browser.close();
console.log('Icons written to static/.');
