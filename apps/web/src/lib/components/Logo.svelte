<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<!-- The Closeknit mark: one thread, the open C of close with the loop of knit. -->
<script lang="ts">
	interface Props {
		size?: number;
		/** Accessible name; leave empty when the mark sits next to the word Closeknit. */
		label?: string;
	}

	let { size = 28, label = '' }: Props = $props();

	// Thicker strokes at small sizes keep the loop readable.
	const strokeWidth = $derived(size <= 20 ? 110 : size <= 36 ? 80 : 50);
</script>

<svg
	class="logo"
	width={Math.round((size * 840) / 960)}
	height={size}
	viewBox="0 0 840 960"
	fill="none"
	role={label ? 'img' : undefined}
	aria-label={label || undefined}
	aria-hidden={label ? undefined : 'true'}
>
	<path
		d="M410 245 C470 140 560 25 660 25 C760 25 815 180 810 380 C805 620 680 935 490 935 C370 935 315 800 300 680 C285 560 280 480 260 400 C240 320 215 295 185 295 C120 295 25 430 25 580 C25 670 45 690 70 690 C120 690 200 590 255 470 C290 395 320 330 320 235"
		stroke="currentColor"
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>

<style>
	.logo {
		flex-shrink: 0;
		display: block;
	}
</style>
