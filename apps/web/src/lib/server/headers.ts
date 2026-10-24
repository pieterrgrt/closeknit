// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Security headers sent with every response, on top of the Content Security
 * Policy that SvelteKit sets from `vite.config.ts`.
 */
export const securityHeaders: Readonly<Record<string, string>> = {
	'x-content-type-options': 'nosniff',
	'referrer-policy': 'same-origin',
	'cross-origin-opener-policy': 'same-origin',
	'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
};

export function applySecurityHeaders(headers: Headers): void {
	for (const [name, value] of Object.entries(securityHeaders)) {
		if (!headers.has(name)) headers.set(name, value);
	}
}
