<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '#lib/components/Icon.svelte';
	import { group } from '#lib/demo/data.js';
	import { demo } from '#lib/demo/store.svelte.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const channel = $derived(demo.channels.find((c) => c.id === data.id)!);
	let text = $state('');
	let openThread = $state<string | null>(null);
	let threadText = $state('');

	function now(): string {
		return new Intl.DateTimeFormat('nl', { hour: '2-digit', minute: '2-digit' }).format(new Date());
	}

	function send(event: SubmitEvent) {
		event.preventDefault();
		if (!text.trim()) return;
		channel.messages.push({
			id: `m-${Date.now()}`,
			author: 'Jij',
			unit: '3e',
			time: now(),
			body: text.trim()
		});
		text = '';
	}

	function sendThread(event: SubmitEvent, id: string) {
		event.preventDefault();
		const message = channel.messages.find((m) => m.id === id);
		if (!message || !threadText.trim()) return;
		message.thread = [...(message.thread ?? []), { author: 'Jij', body: threadText.trim() }];
		threadText = '';
	}
</script>

<svelte:head>
	<title># {channel.name} · {group.name}</title>
</svelte:head>

<div class="chat">
	<header class="head">
		<a class="back" href={resolve('/demo/(app)/chat')} aria-label="Alle kanalen">
			<Icon name="back" />
		</a>
		<div>
			<h1># {channel.name}</h1>
			<p class="meta">{channel.members} buren · {channel.note}</p>
		</div>
	</header>

	<ol class="messages" aria-live="polite">
		<li class="day" aria-hidden="true"><span>Vandaag</span></li>
		{#each channel.messages as message (message.id)}
			{@const mine = message.author === 'Jij'}
			<li class="message" class:mine>
				<p class="meta">
					{#if !mine}<span class="author">{message.author}</span> · {message.unit} ·
					{/if}{mine ? 'Jij · ' : ''}{message.time}
				</p>
				<p class="bubble">{message.body}</p>
				{#if message.thread?.length || openThread === message.id}
					<button
						type="button"
						class="thread-toggle"
						aria-expanded={openThread === message.id}
						onclick={() => (openThread = openThread === message.id ? null : message.id)}
					>
						<Icon name="reply" size={16} />
						{message.thread?.length
							? `${message.thread.length} ${message.thread.length === 1 ? 'antwoord' : 'antwoorden'} in het draadje`
							: 'Draadje'}
					</button>
				{:else}
					<button
						type="button"
						class="thread-toggle quiet"
						onclick={() => (openThread = message.id)}
					>
						<Icon name="reply" size={16} /> Antwoorden
					</button>
				{/if}
				{#if openThread === message.id}
					<div class="thread">
						{#each message.thread ?? [] as answer, i (i)}
							<p><span class="author">{answer.author}</span> {answer.body}</p>
						{/each}
						<form class="thread-form" onsubmit={(e) => sendThread(e, message.id)}>
							<label class="visually-hidden" for={`thread-${message.id}`}>Antwoord in draadje</label
							>
							<input
								id={`thread-${message.id}`}
								class="field"
								placeholder="Antwoord in het draadje"
								bind:value={threadText}
							/>
							<button type="submit" class="btn btn-small">Stuur</button>
						</form>
					</div>
				{/if}
			</li>
		{/each}
	</ol>

	<form class="composer" onsubmit={send}>
		<label for="chat-input" class="visually-hidden">Bericht aan {channel.name}</label>
		<input
			id="chat-input"
			class="field"
			placeholder={`Bericht aan ${channel.name}`}
			bind:value={text}
			autocomplete="off"
		/>
		<button type="submit" class="send" aria-label="Versturen" disabled={!text.trim()}>
			<Icon name="send" size={20} />
		</button>
	</form>
</div>

<style>
	.chat {
		max-width: 720px;
		display: flex;
		flex-direction: column;
		min-height: calc(100svh - 48px - 96px);
	}

	.head {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 12px 12px 12px 8px;
		background: var(--surface);
		border-bottom: 1px solid var(--rule);
	}

	.back {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--ink);
	}

	h1 {
		font-size: 1.25rem;
		font-weight: 650;
	}

	.messages {
		list-style: none;
		margin: 0;
		padding: 18px 16px;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 14px;
	}

	.day {
		display: flex;
		align-items: center;
		gap: 12px;
		color: var(--muted);
		font-size: 0.8125rem;
	}

	.day::before,
	.day::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--rule);
	}

	.message {
		max-width: 84%;
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: flex-start;
	}

	.message.mine {
		align-self: flex-end;
		align-items: flex-end;
	}

	.author {
		font-weight: 600;
		color: var(--ink);
	}

	.bubble {
		padding: 10px 14px;
		border-radius: 4px 14px 14px 14px;
		background: var(--surface);
		border: 1px solid var(--rule);
		line-height: 1.45;
	}

	.mine .bubble {
		border-radius: 14px 4px 14px 14px;
		background: var(--soft);
		border-color: transparent;
	}

	.thread-toggle {
		min-height: 32px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--accent);
		font-size: 0.875rem;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
	}

	.thread-toggle.quiet {
		color: var(--muted);
	}

	.thread {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-left: 12px;
		border-left: 2px solid var(--rule);
	}

	.thread p {
		font-size: 0.9375rem;
		color: var(--body);
	}

	.thread-form {
		display: flex;
		gap: 8px;
	}

	.composer {
		position: sticky;
		bottom: 72px;
		display: flex;
		gap: 10px;
		padding: 10px 12px;
		background: var(--surface);
		border-top: 1px solid var(--rule);
	}

	.composer .field {
		border-radius: 999px;
		background: var(--paper);
	}

	.send {
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		border: 0;
		border-radius: 999px;
		background: var(--accent);
		color: var(--on-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.send:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	@media (min-width: 900px) {
		.chat {
			min-height: calc(100svh - 48px);
		}

		.composer {
			bottom: 0;
		}
	}
</style>
