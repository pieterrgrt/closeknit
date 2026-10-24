<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<!-- Results appear only after voting, so nobody follows the crowd. -->
<script lang="ts">
	import { percentage } from '#lib/demo/format.js';
	import { demo } from '#lib/demo/store.svelte.js';

	let choice = $state<string | null>(null);
	const poll = demo.poll;
	const total = $derived(poll.options.reduce((sum, o) => sum + o.votes, 0));

	function vote(event: SubmitEvent) {
		event.preventDefault();
		if (!choice) return;
		const option = poll.options.find((o) => o.id === choice);
		if (option) option.votes += 1;
		poll.voted = choice;
	}

	function undo() {
		const option = poll.options.find((o) => o.id === poll.voted);
		if (option) option.votes -= 1;
		poll.voted = null;
	}
</script>

<section class="poll" aria-labelledby="poll-title">
	<h2 id="poll-title">Even stemmen</h2>
	<p class="question">{poll.question}</p>

	{#if poll.voted}
		<ul class="results">
			{#each poll.options as option (option.id)}
				{@const pct = percentage(option.votes, total)}
				<li>
					<div class="row">
						<span>
							{option.label}
							{#if option.id === poll.voted}<strong class="mine">· jouw stem</strong>{/if}
						</span>
						<span class="pct">{pct}%</span>
					</div>
					<progress max="100" value={pct} aria-label={`${option.label}: ${pct}%`}></progress>
				</li>
			{/each}
		</ul>
		<p class="meta">
			{total} stemmen · {poll.closes} ·
			<button type="button" class="link" onclick={undo}>Stem wijzigen</button>
		</p>
	{:else}
		<form onsubmit={vote}>
			<fieldset>
				<legend class="visually-hidden">{poll.question}</legend>
				{#each poll.options as option (option.id)}
					<label class="option">
						<input type="radio" name="poll" value={option.id} bind:group={choice} />
						{option.label}
					</label>
				{/each}
			</fieldset>
			<div class="actions">
				<button type="submit" class="btn btn-primary btn-small" disabled={!choice}>Stemmen</button>
				<span class="meta">Uitslag na het stemmen · {poll.closes}</span>
			</div>
		</form>
	{/if}
</section>

<style>
	.poll {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	h2 {
		font-size: 1.3125rem;
		font-weight: 650;
	}

	.question {
		color: var(--body);
	}

	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.option {
		min-height: 48px;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0 14px;
		border: 1.5px solid var(--rule);
		border-radius: 10px;
		cursor: pointer;
	}

	.option:has(input:checked) {
		border-color: var(--accent);
		background: var(--soft);
	}

	.option input {
		width: 18px;
		height: 18px;
		accent-color: var(--accent);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		margin-top: 4px;
	}

	.btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.results {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.row {
		display: flex;
		justify-content: space-between;
		gap: 12px;
	}

	.mine {
		color: var(--accent);
		font-weight: 600;
	}

	.pct {
		font-variant-numeric: tabular-nums;
		color: var(--muted);
	}

	progress {
		width: 100%;
		height: 8px;
		appearance: none;
		border: 0;
		border-radius: 999px;
		background: var(--rule);
		overflow: hidden;
	}

	progress::-webkit-progress-bar {
		background: var(--rule);
	}

	progress::-webkit-progress-value {
		background: var(--accent);
		border-radius: 999px;
	}

	progress::-moz-progress-bar {
		background: var(--accent);
		border-radius: 999px;
	}

	.link {
		padding: 0;
		border: 0;
		background: none;
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
		font-size: inherit;
	}
</style>
