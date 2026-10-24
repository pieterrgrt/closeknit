<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<!-- What signing in will look like (M1). Nothing is sent. -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Icon from '#lib/components/Icon.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import { group } from '#lib/demo/data.js';

	let email = $state('');
	let sent = $state(false);

	const languages = [
		'Nederlands',
		'English',
		'Deutsch',
		'Français',
		'Español',
		'Italiano',
		'中文（简体）',
		'日本語'
	];

	function sendLink(event: SubmitEvent) {
		event.preventDefault();
		sent = true;
	}
</script>

<svelte:head>
	<title>Inloggen · Closeknit</title>
</svelte:head>

<div class="screen">
	<header class="top">
		<a class="brand" href={resolve('/demo/(app)')}>
			<Logo size={28} />
			<span>Closeknit</span>
		</a>
		<label class="lang">
			<span>Taal</span>
			<select>
				{#each languages as language (language)}
					<option>{language}</option>
				{/each}
			</select>
		</label>
	</header>

	<main class="content">
		<div class="intro">
			<p class="eyebrow">{group.name} nodigt je uit</p>
			<h1>Welkom thuis.</h1>
			<p class="lead">Log in om je buren te zien. Geen wachtwoord, geen telefoonnummer.</p>
		</div>

		{#if sent}
			<section class="sent" aria-live="polite">
				<span class="mail"><Icon name="mail" size={30} /></span>
				<h2>Kijk in je mail</h2>
				<p>
					We stuurden een link naar <strong>{email || 'je adres'}</strong>. Hij is 15 minuten geldig
					en werkt één keer. Daarna kun je een passkey aanmaken, dan gaat het de volgende keer met
					je vingerafdruk of gezicht.
				</p>
				<div class="row">
					<button
						type="button"
						class="btn btn-primary"
						onclick={() => goto(resolve('/demo/(app)'))}
					>
						Verder naar het voorbeeld
					</button>
					<button type="button" class="btn" onclick={() => (sent = false)}>Ander adres</button>
				</div>
			</section>
		{:else}
			<div class="form">
				<button
					type="button"
					class="btn btn-primary big"
					onclick={() => goto(resolve('/demo/(app)'))}
				>
					<Icon name="key" size={20} /> Inloggen met passkey
				</button>
				<p class="divider"><span>of met een link per e-mail</span></p>
				<form onsubmit={sendLink}>
					<label for="email">E-mailadres</label>
					<input
						id="email"
						class="field"
						type="email"
						autocomplete="email"
						placeholder="naam@voorbeeld.eu"
						bind:value={email}
					/>
					<button type="submit" class="btn big">Stuur me een inloglink</button>
				</form>
			</div>
		{/if}
	</main>

	<p class="foot">
		Gehost in Europa · open source · zonder advertenties<br />Alleen functionele cookies.
	</p>
</div>

<style>
	.screen {
		min-height: 100svh;
		max-width: 460px;
		margin: 0 auto;
		padding: 20px 22px 28px;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--accent);
		text-decoration: none;
	}

	.brand span {
		color: var(--ink);
		font-size: 1.125rem;
		font-weight: 650;
	}

	.lang {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.875rem;
		color: var(--muted);
	}

	.lang select {
		min-height: 44px;
		padding: 0 10px;
		border: 1px solid var(--field);
		border-radius: 8px;
		background: var(--surface);
		color: var(--ink);
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 28px;
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	h1 {
		font-size: 2.75rem;
		line-height: 1.02;
		font-weight: 650;
		letter-spacing: -0.025em;
	}

	.lead {
		font-size: 1.0625rem;
		color: var(--body);
	}

	.form,
	form {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	form label {
		font-weight: 600;
	}

	.big {
		min-height: 52px;
		font-size: 1.0625rem;
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 12px;
		color: var(--muted);
		font-size: 0.875rem;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--rule);
	}

	.sent {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 22px;
		border-radius: 14px;
		background: var(--surface);
		border: 1px solid var(--rule);
	}

	.mail {
		color: var(--accent);
	}

	.sent h2 {
		font-size: 1.5rem;
		font-weight: 650;
	}

	.sent p {
		color: var(--body);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.foot {
		text-align: center;
		font-size: 0.8125rem;
		color: var(--muted);
	}
</style>
