// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { joinNames, percentage } from './format';

describe('joinNames', () => {
	it('handles no, one and two names', () => {
		expect(joinNames([])).toBe('');
		expect(joinNames(['Mira'])).toBe('Mira');
		expect(joinNames(['Mira', 'Jonas'])).toBe('Mira en Jonas');
	});

	it('lists three names in full', () => {
		expect(joinNames(['Mira', 'Jonas', 'Lena'])).toBe('Mira, Jonas en Lena');
	});

	it('summarises longer lists', () => {
		expect(joinNames(['Mira', 'Jonas', 'Lena', 'Sam'])).toBe('Mira, Jonas en 2 anderen');
		expect(joinNames(['a', 'b', 'c', 'd', 'e', 'f'])).toBe('a, b en 4 anderen');
	});
});

describe('percentage', () => {
	it('rounds and survives zero votes', () => {
		expect(percentage(1, 3)).toBe(33);
		expect(percentage(0, 0)).toBe(0);
	});
});
