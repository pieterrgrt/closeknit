<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { group, type Item, type ItemKind } from '#lib/demo/data.js';
	import { demo } from '#lib/demo/store.svelte.js';

	let filter = $state<ItemKind | 'alles'>('alles');
	const visible = $derived(demo.items.filter((i) => filter === 'alles' || i.kind === filter));

	const filters: { id: ItemKind | 'alles'; label: string }[] = [
		{ id: 'alles', label: 'Alles' },
		{ id: 'lenen', label: 'Te leen' },
		{ id: 'weggeven', label: 'Weggeven' }
	];

	function toggle(item: Item) {
		const stored = demo.items.find((i) => i.id === item.id);
		if (stored) stored.requested = !stored.requested;
	}
</script>

<svelte:head>
	<title>Uitleenhoek · {group.name}</title>
</svelte:head>

<div class="page">
	<header class="head">
		<h1>Uitleenhoek</h1>
		<p class="meta">
			Lenen en weggeven binnen het gebouw. Zo hoeft niet iedereen een boormachine te hebben.
		</p>
		<div class="filters" role="group" aria-label="Laat zien">
			{#each filters as f (f.id)}
				<button
					type="button"
					class="chip"
					aria-pressed={filter === f.id}
					onclick={() => (filter = f.id)}>{f.label}</button
				>
			{/each}
		</div>
	</header>

	<ul class="items">
		{#each visible as item (item.id)}
			<li class="item">
				<span class="icon"><Icon name="box" size={26} /></span>
				<div class="text">
					<h2>{item.title}</h2>
					<p class="meta">{item.owner} · {item.unit}</p>
					<p class="note">{item.note}</p>
					{#if item.requested}
						<p class="sent">
							<Icon name="check" size={16} />
							{item.owner} krijgt je vraag en laat het je weten.
						</p>
					{/if}
				</div>
				<div class="side">
					<span class="tag">{item.kind === 'lenen' ? 'Te leen' : 'Weggeven'}</span>
					<button
						type="button"
						class="btn btn-small"
						class:btn-primary={!item.requested}
						aria-pressed={item.requested}
						onclick={() => toggle(item)}
					>
						{item.requested ? 'Vraag intrekken' : item.kind === 'lenen' ? 'Lenen' : 'Ik wil het'}
					</button>
				</div>
			</li>
		{/each}
	</ul>
</div>

<style>
	.page {
		max-width: 720px;
		padding: 22px 20px 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-bottom: 14px;
		border-bottom: 2px solid var(--ink);
	}

	h1 {
		font-size: 2.25rem;
		line-height: 1.05;
		font-weight: 650;
		letter-spacing: -0.02em;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.items {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.item {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 12px 14px;
		padding: 16px 0;
		border-bottom: 1px solid var(--rule);
	}

	.icon {
		width: 56px;
		height: 56px;
		border-radius: 10px;
		background: var(--soft);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	h2 {
		font-size: 1.125rem;
		font-weight: 650;
	}

	.note {
		color: var(--body);
		font-size: 0.9375rem;
	}

	.sent {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 4px;
		color: var(--accent);
		font-size: 0.9375rem;
	}

	.side {
		grid-column: 2;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}

	@media (min-width: 640px) {
		.item {
			grid-template-columns: auto minmax(0, 1fr) auto;
		}

		.side {
			grid-column: 3;
			flex-direction: column;
			align-items: flex-end;
		}
	}
</style>
