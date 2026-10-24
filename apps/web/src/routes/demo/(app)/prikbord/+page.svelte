<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { group, subgroups, type Post, type SubgroupId } from '#lib/demo/data.js';
	import { joinNames } from '#lib/demo/format.js';
	import { demo } from '#lib/demo/store.svelte.js';

	let filter = $state<SubgroupId | 'alles'>('alles');
	let writing = $state(false);
	let title = $state('');
	let body = $state('');
	let open = $state<Record<string, boolean>>({});
	let replies = $state<Record<string, string>>({});

	const visible = $derived(
		demo.posts.filter((p) => p.pinned || filter === 'alles' || p.subgroup === filter)
	);

	function publish(event: SubmitEvent) {
		event.preventDefault();
		if (!title.trim()) return;
		demo.posts.splice(1, 0, {
			id: `nieuw-${Date.now()}`,
			author: 'Jij',
			unit: '3e',
			when: 'zojuist',
			subgroup: filter === 'alles' ? 'gebouw' : filter,
			title: title.trim(),
			body: body.trim(),
			liked: [],
			comments: []
		});
		title = '';
		body = '';
		writing = false;
	}

	function toggleLike(post: Post) {
		const stored = demo.posts.find((p) => p.id === post.id);
		if (!stored) return;
		const i = stored.liked.indexOf('Jij');
		if (i === -1) stored.liked.unshift('Jij');
		else stored.liked.splice(i, 1);
	}

	function reply(event: SubmitEvent, post: Post) {
		event.preventDefault();
		const text = (replies[post.id] ?? '').trim();
		const stored = demo.posts.find((p) => p.id === post.id);
		if (!text || !stored) return;
		stored.comments.push({ author: 'Jij', body: text });
		replies[post.id] = '';
	}

	function likedLine(names: string[]): string {
		const sorted = names.includes('Jij') ? ['Jij', ...names.filter((n) => n !== 'Jij')] : names;
		const line = joinNames(sorted);
		return `${line} ${sorted.length === 1 && sorted[0] !== 'Jij' ? 'vindt' : 'vinden'} dit fijn`;
	}
</script>

<svelte:head>
	<title>Prikbord · {group.name}</title>
</svelte:head>

<div class="page">
	<header class="head">
		<h1>Prikbord</h1>
		<div class="filters" role="group" aria-label="Laat zien">
			<button
				type="button"
				class="chip"
				aria-pressed={filter === 'alles'}
				onclick={() => (filter = 'alles')}>Alles</button
			>
			{#each subgroups as sub (sub.id)}
				<button
					type="button"
					class="chip"
					aria-pressed={filter === sub.id}
					onclick={() => (filter = sub.id)}>{sub.name}</button
				>
			{/each}
		</div>
	</header>

	{#if writing}
		<form class="compose" onsubmit={publish}>
			<label for="post-title" class="visually-hidden">Titel</label>
			<input
				id="post-title"
				class="field"
				placeholder="Waar gaat het over?"
				bind:value={title}
				maxlength="120"
			/>
			<label for="post-body" class="visually-hidden">Bericht</label>
			<textarea
				id="post-body"
				class="field"
				rows="3"
				placeholder="Vertel meer (mag leeg blijven)"
				bind:value={body}></textarea>
			<div class="compose-actions">
				<button type="submit" class="btn btn-primary btn-small" disabled={!title.trim()}
					>Plaatsen</button
				>
				<button type="button" class="btn btn-small" onclick={() => (writing = false)}
					>Annuleren</button
				>
			</div>
		</form>
	{:else}
		<button type="button" class="prompt" onclick={() => (writing = true)}>
			Schrijf iets voor je buren…
		</button>
	{/if}

	{#each visible as post (post.id)}
		<article class="post" class:pinned={post.pinned}>
			{#if post.pinned}
				<p class="pin"><Icon name="pin" size={14} /> Vastgezet door de beheerder</p>
			{:else}
				<div class="byline">
					<span class="avatar" aria-hidden="true">{post.author[0]}</span>
					<span class="who">
						<span class="name">{post.author}</span>
						<span class="meta">{post.unit} · {post.when}</span>
					</span>
				</div>
			{/if}

			<h2>{post.title}</h2>
			{#if post.photo}
				<div class="photo" role="img" aria-label={`Foto: ${post.photo}`}>
					<span>[foto: {post.photo}]</span>
				</div>
			{/if}
			{#if post.body}
				<p class="text">{post.body}</p>
			{/if}

			{#if post.pinned}
				<p class="meta">{post.author} · {post.unit} · {post.when}</p>
			{:else}
				{#if post.liked.length}
					<p class="meta">{likedLine(post.liked)}</p>
				{/if}

				<div class="actions">
					<button
						type="button"
						class="action"
						aria-pressed={post.liked.includes('Jij')}
						onclick={() => toggleLike(post)}
					>
						<Icon name="heart" size={18} /> Fijn
					</button>
					<button
						type="button"
						class="action"
						aria-expanded={!!open[post.id]}
						onclick={() => (open[post.id] = !open[post.id])}
					>
						<Icon name="chat" size={18} />
						{post.comments.length
							? `${post.comments.length} ${post.comments.length === 1 ? 'reactie' : 'reacties'}`
							: 'Reageren'}
					</button>
				</div>

				{#if open[post.id]}
					<div class="thread">
						{#each post.comments as comment, i (i)}
							<p><span class="name">{comment.author}</span> {comment.body}</p>
						{/each}
						<form class="reply" onsubmit={(e) => reply(e, post)}>
							<label class="visually-hidden" for={`reply-${post.id}`}>Reactie</label>
							<input
								id={`reply-${post.id}`}
								class="field"
								placeholder="Schrijf een reactie"
								bind:value={replies[post.id]}
							/>
							<button type="submit" class="btn btn-small">Plaatsen</button>
						</form>
					</div>
				{/if}
			{/if}
		</article>
	{/each}

	<p class="end">Je hebt alles van de afgelopen week gezien.</p>
</div>

<style>
	.page {
		max-width: 680px;
		padding: 22px 20px 0;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: 14px;
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

	.prompt {
		min-height: 52px;
		padding: 0 16px;
		border: 1.5px solid var(--field);
		border-radius: 12px;
		background: var(--surface);
		color: var(--muted);
		text-align: left;
		cursor: text;
	}

	.compose {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	textarea.field {
		resize: vertical;
	}

	.compose-actions,
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.post {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--rule);
	}

	.post.pinned {
		padding: 16px 18px;
		border: 0;
		border-radius: var(--radius);
		background: var(--soft);
	}

	.pin {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8125rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--body);
	}

	.byline {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: 999px;
		background: var(--rule);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 650;
	}

	.who {
		display: flex;
		flex-direction: column;
		line-height: 1.3;
	}

	.name {
		font-weight: 600;
	}

	h2 {
		font-size: 1.3125rem;
		line-height: 1.25;
		font-weight: 650;
	}

	.photo {
		height: 180px;
		border-radius: 10px;
		background: color-mix(in srgb, var(--ink) 7%, var(--paper));
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted);
		font-size: 0.875rem;
	}

	.text {
		color: var(--body);
	}

	.action {
		min-height: 44px;
		padding: 0 4px;
		border: 0;
		background: none;
		color: var(--body);
		display: inline-flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
	}

	.action[aria-pressed='true'] {
		color: var(--accent);
		font-weight: 600;
	}

	.thread {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-left: 14px;
		border-left: 2px solid var(--rule);
	}

	.thread p {
		color: var(--body);
		font-size: 0.9375rem;
	}

	.reply {
		display: flex;
		gap: 8px;
	}

	.end {
		text-align: center;
		font-style: italic;
		color: var(--muted);
	}
</style>
