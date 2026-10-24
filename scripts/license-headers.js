#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Checks (--check) or adds (--fix) the SPDX licence header in every file that
 * can carry a comment. Files that cannot (JSON, Markdown, the licence itself)
 * are covered by REUSE.toml.
 *
 *   node scripts/license-headers.js --check
 *   node scripts/license-headers.js --fix [path ...]
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';

const COPYRIGHT = '2026 Aldus Lab and Closeknit contributors';
const LICENSE = 'AGPL-3.0-or-later';
const LINES = [`SPDX-FileCopyrightText: ${COPYRIGHT}`, `SPDX-License-Identifier: ${LICENSE}`];

const line = (prefix) => (/** @type {string[]} */ lines) =>
	lines.map((l) => `${prefix} ${l}`).join('\n');
const block = (open, close) => (/** @type {string[]} */ lines) =>
	[open, ...lines, close].join('\n');

const byExtension = {
	'.ts': line('//'),
	'.js': line('//'),
	'.mjs': line('//'),
	'.cjs': line('//'),
	'.sql': line('--'),
	'.yml': line('#'),
	'.yaml': line('#'),
	'.toml': line('#'),
	'.txt': line('#'),
	'.example': line('#'),
	'.css': block('/*', '*/'),
	'.svelte': block('<!--', '-->'),
	'.html': block('<!--', '-->'),
	'.svg': block('<!--', '-->')
};

const byName = {
	Dockerfile: line('#'),
	Caddyfile: line('#'),
	'.gitignore': line('#'),
	'.prettierignore': line('#'),
	'.dockerignore': line('#'),
	'.editorconfig': line('#'),
	'.npmrc': line('#')
};

/** @param {string} file */
function formatterFor(file) {
	return byName[basename(file)] ?? byExtension[extname(file)];
}

/** @param {string} text */
function hasHeader(text) {
	return text.split('\n', 12).some((l) => l.includes('SPDX-License-Identifier:'));
}

/** @param {string} text @param {(lines: string[]) => string} format */
function withHeader(text, format) {
	const header = format(LINES);
	if (text.startsWith('#!')) {
		const end = text.indexOf('\n') + 1;
		return `${text.slice(0, end)}${header}\n\n${text.slice(end)}`;
	}
	return `${header}\n\n${text}`;
}

const args = process.argv.slice(2);
const fix = args.includes('--fix');
const paths = args.filter((a) => !a.startsWith('--'));

const files = execFileSync(
	'git',
	['ls-files', '--cached', '--others', '--exclude-standard', '--', ...paths],
	{ encoding: 'utf8' }
)
	.split('\n')
	.filter(Boolean);

const missing = [];
for (const file of files) {
	const format = formatterFor(file);
	if (!format) continue;
	let text;
	try {
		text = readFileSync(file, 'utf8');
	} catch {
		continue; // deleted but not yet staged
	}
	if (hasHeader(text)) continue;
	if (fix) writeFileSync(file, withHeader(text, format));
	else missing.push(file);
}

if (missing.length) {
	console.error('Missing licence header (run `pnpm format` to add it):');
	for (const file of missing) console.error(`  ${file}`);
	process.exit(1);
}
