<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { group } from '#lib/demo/data.js';
	import { demo } from '#lib/demo/store.svelte.js';
</script>

<svelte:head>
	<title>Chat · {group.name}</title>
</svelte:head>

<div class="page">
	<header class="head">
		<h1>Chat</h1>
		<p class="meta">Een kanaal voor het hele gebouw en een per verdieping of werkgroep.</p>
	</header>

	<ul class="list">
		{#each demo.channels as channel (channel.id)}
			{@const last = channel.messages.at(-1)}
			<li>
				<a href={resolve('/demo/(app)/chat/[kanaal]', { kanaal: channel.id })}>
					<span class="name"># {channel.name}</span>
					<span class="meta">{channel.members} buren · {channel.note}</span>
					{#if last}
						<span class="last">{last.author}: {last.body}</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	.page {
		max-width: 680px;
		padding: 22px 20px 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding-bottom: 14px;
		border-bottom: 2px solid var(--ink);
	}

	h1 {
		font-size: 2.25rem;
		line-height: 1.05;
		font-weight: 650;
		letter-spacing: -0.02em;
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.list a {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding: 14px 0;
		border-bottom: 1px solid var(--rule);
		color: inherit;
		text-decoration: none;
	}

	.list a:hover .name {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.name {
		font-size: 1.125rem;
		font-weight: 650;
	}

	.last {
		color: var(--body);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
