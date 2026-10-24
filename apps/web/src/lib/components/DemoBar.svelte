<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<!-- Tells visitors this is a demo and lets them try the group accent and theme. -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { accents } from '#lib/demo/data.js';
	import { prefs, type Theme } from '#lib/demo/store.svelte.js';

	const themes: { id: Theme; label: string }[] = [
		{ id: 'system', label: 'Automatisch' },
		{ id: 'light', label: 'Licht' },
		{ id: 'dark', label: 'Donker' }
	];
</script>

<div class="bar">
	<p class="note"><strong>Voorbeeld</strong> · niets wordt opgeslagen</p>
	<a class="login" href={resolve('/demo/inloggen')}>Inlogscherm</a>
	<div class="controls">
		<fieldset class="swatches">
			<legend class="visually-hidden">Accentkleur van de groep</legend>
			{#each accents as accent (accent.id)}
				<label class="swatch" data-swatch={accent.id} title={accent.label}>
					<input
						type="radio"
						name="accent"
						value={accent.id}
						bind:group={prefs.accent}
						class="visually-hidden"
					/>
					<span class="visually-hidden">{accent.label}</span>
				</label>
			{/each}
		</fieldset>
		<label class="theme">
			<span class="visually-hidden">Thema</span>
			<select bind:value={prefs.theme}>
				{#each themes as theme (theme.id)}
					<option value={theme.id}>{theme.label}</option>
				{/each}
			</select>
		</label>
	</div>
</div>

<style>
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 16px;
		padding: 8px 16px;
		background: var(--ink);
		color: var(--paper);
		font-size: 0.875rem;
	}

	.note {
		flex: 1;
	}

	.controls {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}

	.swatches {
		display: flex;
		gap: 6px;
		margin: 0;
		padding: 0;
		border: 0;
	}

	.swatch {
		width: 28px;
		height: 28px;
		border-radius: 999px;
		border: 2px solid transparent;
		cursor: pointer;
		position: relative;
	}

	.swatch:has(input:checked) {
		border-color: var(--paper);
	}

	.swatch:has(input:focus-visible) {
		outline: 3px solid var(--paper);
		outline-offset: 2px;
	}

	.swatch[data-swatch='groen'] {
		background: #2f6b55;
	}
	.swatch[data-swatch='blauw'] {
		background: #2d5b8a;
	}
	.swatch[data-swatch='baksteen'] {
		background: #a54a28;
	}
	.swatch[data-swatch='pruim'] {
		background: #6b4778;
	}
	.swatch[data-swatch='oker'] {
		background: #8a5f0e;
	}

	select {
		min-height: 32px;
		padding: 0 8px;
		border-radius: 8px;
		border: 1px solid color-mix(in srgb, var(--paper) 40%, transparent);
		background: transparent;
		color: var(--paper);
	}

	select option {
		color: #1e2320;
	}

	.login {
		color: var(--paper);
	}

	@media (min-width: 720px) {
		.controls {
			width: auto;
			order: 2;
		}

		.login {
			order: 3;
		}
	}
</style>
