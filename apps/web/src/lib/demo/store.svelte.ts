// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { channels, events, items, poll, posts, type Accent } from './data';

/**
 * The demo's state. Changes (votes, chat messages, sign-ups) live in the browser
 * only and survive navigating between pages, not a reload. Nothing is mutated
 * on the server, where this module only provides the initial render.
 */
export const demo = $state({
	events: structuredClone(events),
	posts: structuredClone(posts),
	items: structuredClone(items),
	channels: structuredClone(channels),
	poll: { ...structuredClone(poll), voted: null as string | null }
});

export type Theme = 'system' | 'light' | 'dark';

/** Viewer preferences for the demo, kept in localStorage. */
export const prefs = $state({ accent: 'groen' as Accent, theme: 'system' as Theme });
