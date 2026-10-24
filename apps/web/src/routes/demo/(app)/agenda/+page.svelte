<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import EventRow from '#lib/components/EventRow.svelte';
	import { group } from '#lib/demo/data.js';
	import { demo } from '#lib/demo/store.svelte.js';
</script>

<svelte:head>
	<title>Agenda · {group.name}</title>
</svelte:head>

<div class="page">
	<header class="head">
		<h1>Agenda</h1>
		<p class="meta">
			Wat er in en rond het gebouw gebeurt. Meld je aan, dan weet iedereen wie er komt.
		</p>
	</header>

	{#each demo.events as event (event.id)}
		<EventRow {event} detailed />
	{/each}
</div>

<style>
	.page {
		max-width: 680px;
		padding: 22px 20px 0;
		display: flex;
		flex-direction: column;
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding-bottom: 14px;
		margin-bottom: 4px;
		border-bottom: 2px solid var(--ink);
	}

	h1 {
		font-size: 2.25rem;
		line-height: 1.05;
		font-weight: 650;
		letter-spacing: -0.02em;
	}
</style>
