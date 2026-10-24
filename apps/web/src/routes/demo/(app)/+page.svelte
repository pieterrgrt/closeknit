<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import EventRow from '#lib/components/EventRow.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import PollCard from '#lib/components/PollCard.svelte';
	import { announcement, group } from '#lib/demo/data.js';
	import { demo } from '#lib/demo/store.svelte.js';

	const latestPosts = $derived(demo.posts.filter((p) => !p.pinned).slice(0, 2));
	const available = $derived(demo.items.filter((i) => !i.requested).slice(0, 2));
</script>

<svelte:head>
	<title>Wat speelt er · {group.name}</title>
</svelte:head>

<div class="cover" aria-hidden="true">
	<svg viewBox="0 0 300 112" fill="none" stroke="currentColor" stroke-width="1.6">
		<rect x="40" y="10" width="220" height="102" />
		<path d="M40 10 150 0 260 10" />
		<rect x="58" y="26" width="22" height="26" /><rect x="98" y="26" width="22" height="26" />
		<rect x="138" y="26" width="22" height="26" /><rect x="178" y="26" width="22" height="26" />
		<rect x="218" y="26" width="22" height="26" /><rect x="58" y="66" width="22" height="26" />
		<rect x="98" y="66" width="22" height="26" /><rect x="178" y="66" width="22" height="26" />
		<rect x="218" y="66" width="22" height="26" /><rect x="136" y="70" width="28" height="42" />
	</svg>
</div>

<div class="page">
	<header class="masthead">
		<p class="eyebrow">{group.dateLine}</p>
		<h1>{group.name}</h1>
		<p class="meta">{group.place} · {group.members} buren</p>
	</header>

	<div class="columns">
		<div class="column">
			<section class="notice" aria-labelledby="notice-title">
				<p class="from">{announcement.from}</p>
				<h2 id="notice-title">{announcement.title}</h2>
				<p>{announcement.body}</p>
			</section>

			<section aria-labelledby="week-title">
				<div class="section-head">
					<h2 id="week-title">Deze week</h2>
					<a href={resolve('/demo/(app)/agenda')}>Agenda</a>
				</div>
				{#each demo.events.slice(0, 2) as event (event.id)}
					<EventRow {event} />
				{/each}
			</section>

			<section aria-labelledby="board-title">
				<div class="section-head">
					<h2 id="board-title">Op het prikbord</h2>
					<a href={resolve('/demo/(app)/prikbord')}>Alles</a>
				</div>
				{#each latestPosts as post (post.id)}
					<a class="summary" href={resolve('/demo/(app)/prikbord')}>
						<span class="summary-title">{post.title}</span>
						<span class="meta">
							{post.author} · {post.unit} · {post.when}{post.comments.length
								? ` · ${post.comments.length} ${post.comments.length === 1 ? 'reactie' : 'reacties'}`
								: ''}
						</span>
					</a>
				{/each}
			</section>
		</div>

		<div class="column">
			<section aria-labelledby="lend-title">
				<div class="section-head">
					<h2 id="lend-title">Uitleenhoek</h2>
					<a href={resolve('/demo/(app)/uitleen')}>Alles</a>
				</div>
				{#each available as item (item.id)}
					<a class="item" href={resolve('/demo/(app)/uitleen')}>
						<span class="item-icon"><Icon name="box" size={24} /></span>
						<span class="item-text">
							<span class="summary-title">{item.title}</span>
							<span class="meta">
								{item.kind === 'lenen' ? 'Te leen' : 'Weggeven'} bij {item.owner} · {item.unit}
							</span>
						</span>
					</a>
				{/each}
			</section>

			<PollCard />
		</div>
	</div>

	<p class="end">Dat was het voor deze week.<br />De samenvatting komt zondag per e-mail.</p>
</div>

<style>
	.cover {
		height: 132px;
		background: var(--soft);
		color: var(--accent);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		overflow: hidden;
		opacity: 0.9;
	}

	.cover svg {
		width: 300px;
		height: 112px;
		opacity: 0.55;
	}

	.page {
		max-width: 1040px;
		padding: 20px 20px 0;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}

	.masthead {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding-bottom: 14px;
		border-bottom: 2px solid var(--ink);
	}

	h1 {
		font-size: clamp(2.25rem, 6vw, 3.25rem);
		line-height: 1.02;
		font-weight: 650;
		letter-spacing: -0.025em;
	}

	.columns {
		display: grid;
		gap: 28px;
	}

	.column {
		display: flex;
		flex-direction: column;
		gap: 28px;
		min-width: 0;
	}

	@media (min-width: 1100px) {
		.columns {
			grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
			gap: 48px;
		}

		.column + .column {
			padding-left: 32px;
			border-left: 1px solid var(--rule);
		}
	}

	.notice {
		padding: 16px 18px;
		border-radius: var(--radius);
		background: var(--accent);
		color: var(--on-accent);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.notice .from {
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.85;
	}

	.notice h2 {
		font-size: 1.25rem;
		line-height: 1.25;
		font-weight: 650;
	}

	.notice p:last-child {
		opacity: 0.92;
	}

	.section-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
		margin-bottom: 4px;
	}

	.section-head h2 {
		font-size: 1.3125rem;
		font-weight: 650;
	}

	.summary {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding: 12px 0;
		border-bottom: 1px solid var(--rule);
		color: inherit;
		text-decoration: none;
	}

	.summary:hover .summary-title,
	.item:hover .summary-title {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.summary-title {
		font-size: 1.0625rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.item {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 10px 0;
		color: inherit;
		text-decoration: none;
	}

	.item-icon {
		width: 52px;
		height: 52px;
		flex-shrink: 0;
		border-radius: 10px;
		background: var(--soft);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.item-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.end {
		padding: 16px 0 8px;
		border-top: 1px solid var(--rule);
		text-align: center;
		font-style: italic;
		color: var(--muted);
	}
</style>
