<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { accents, type Accent } from '#lib/demo/data.js';
	import { prefs, type Theme } from '#lib/demo/store.svelte.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const KEY = 'closeknit-demo-prefs';
	let loaded = $state(false);

	onMount(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as {
				accent?: Accent;
				theme?: Theme;
			};
			if (accents.some((a) => a.id === saved.accent)) prefs.accent = saved.accent!;
			if (saved.theme === 'light' || saved.theme === 'dark' || saved.theme === 'system') {
				prefs.theme = saved.theme;
			}
		} catch {
			// Storage can be unavailable (private mode); the defaults are fine.
		}
		loaded = true;
	});

	$effect(() => {
		if (!loaded) return;
		const root = document.documentElement;
		root.dataset.accent = prefs.accent;
		if (prefs.theme === 'system') delete root.dataset.theme;
		else root.dataset.theme = prefs.theme;
		try {
			localStorage.setItem(KEY, JSON.stringify({ accent: prefs.accent, theme: prefs.theme }));
		} catch {
			// Ignore: preferences then last for this visit only.
		}
	});
</script>

{@render children()}
