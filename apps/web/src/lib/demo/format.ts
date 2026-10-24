// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * "Mira", "Mira en Jonas", "Mira, Jonas en Lena", "Mira, Jonas en 4 anderen".
 * Names instead of counters: the design avoids like counts.
 */
export function joinNames(names: string[], shown = 2): string {
	if (names.length === 0) return '';
	if (names.length === 1) return names[0]!;
	if (names.length <= shown + 1) {
		return `${names.slice(0, -1).join(', ')} en ${names.at(-1)}`;
	}
	const rest = names.length - shown;
	return `${names.slice(0, shown).join(', ')} en ${rest} ${rest === 1 ? 'ander' : 'anderen'}`;
}

/** Share of the votes as a whole percentage; 0 when nobody has voted. */
export function percentage(votes: number, total: number): number {
	return total === 0 ? 0 : Math.round((votes / total) * 100);
}
