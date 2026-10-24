// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { applySecurityHeaders, securityHeaders } from './headers';

describe('applySecurityHeaders', () => {
	it('adds every security header', () => {
		const headers = new Headers();
		applySecurityHeaders(headers);
		for (const [name, value] of Object.entries(securityHeaders)) {
			expect(headers.get(name)).toBe(value);
		}
	});

	it('keeps a header a route already set', () => {
		const headers = new Headers({ 'referrer-policy': 'no-referrer' });
		applySecurityHeaders(headers);
		expect(headers.get('referrer-policy')).toBe('no-referrer');
	});
});
