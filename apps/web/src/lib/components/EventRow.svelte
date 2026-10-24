<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import type { EventItem } from '#lib/demo/data.js';
	import { joinNames } from '#lib/demo/format.js';
	import { demo } from '#lib/demo/store.svelte.js';

	interface Props {
		event: EventItem;
		detailed?: boolean;
	}

	let { event, detailed = false }: Props = $props();

	// Change the shared demo state, not the prop.
	function toggle() {
		const stored = demo.events.find((e) => e.id === event.id);
		if (stored) stored.attending = !stored.attending;
	}

	const who = $derived(
		event.attending
			? `Jij${event.attendees.length ? ` en ${joinNames(event.attendees)}` : ''} komen`
			: event.attendees.length
				? `${joinNames(event.attendees)} ${event.attendees.length === 1 ? 'komt' : 'komen'}`
				: 'Nog niemand aangemeld'
	);
</script>

<article class="event">
	<div class="date" aria-hidden="true">
		<span class="weekday">{event.weekday}</span>
		<span class="day">{event.day}</span>
		<span class="month">{event.month}</span>
	</div>
	<div class="body">
		<h3>{event.title}</h3>
		<p class="meta">
			<span class="visually-hidden">{event.weekday} {event.day} {event.month}, </span>{event.time} · {event.place}
		</p>
		{#if detailed}
			<p class="description">{event.description}</p>
		{/if}
		<p class="meta">{who}</p>
		<button
			type="button"
			class="btn btn-small"
			class:btn-primary={!event.attending}
			aria-pressed={event.attending}
			onclick={() => toggle()}
		>
			{event.attending ? 'Afmelden' : 'Ik kom'}
		</button>
	</div>
</article>

<style>
	.event {
		display: flex;
		gap: 16px;
		align-items: flex-start;
		padding: 14px 0;
		border-bottom: 1px solid var(--rule);
	}

	.date {
		width: 48px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: var(--accent);
		line-height: 1.1;
	}

	.weekday,
	.month {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.day {
		font-size: 1.625rem;
		font-weight: 650;
	}

	.body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: flex-start;
	}

	h3 {
		font-size: 1.0625rem;
		font-weight: 650;
	}

	.description {
		color: var(--body);
		font-size: 0.9375rem;
	}

	.btn {
		margin-top: 6px;
	}
</style>
