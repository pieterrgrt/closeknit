<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<!-- A small set of stroke icons; decorative unless the caller labels the control. -->
<script lang="ts">
	const paths = {
		home: 'M3 11 12 4l9 7v9H3z M9 20v-6h6v6',
		board: 'M4 4h16v16H4z M8 9h8 M8 13h8 M8 17h5',
		chat: 'M4 5h16v11H9l-5 4z',
		calendar: 'M4 5h16v15H4z M4 10h16 M9 3v4 M15 3v4',
		box: 'M4 8l8-4 8 4v9l-8 4-8-4z M4 8l8 4 8-4 M12 12v9',
		pin: 'M9 4h6l-1 6 4 3H6l4-3z M12 13v8',
		heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
		reply: 'M5 4v9a3 3 0 0 0 3 3h11 M15 12l4 4-4 4',
		send: 'M5 12h14 M13 6l6 6-6 6',
		back: 'M15 5l-7 7 7 7',
		check: 'M5 12l5 5 9-10',
		key: 'M4 15a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M10.8 12.2 20 3 M16 7l3 3 M18 5l2 2',
		mail: 'M3 5h18v14H3z M3 7l9 6 9-6',
		sun: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8 M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
		moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z'
	} as const;

	interface Props {
		name: keyof typeof paths;
		size?: number;
	}

	let { name, size = 22 }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d={paths[name]} />
</svg>
