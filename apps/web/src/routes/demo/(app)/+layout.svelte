<!--
SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import DemoBar from '#lib/components/DemoBar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import { group } from '#lib/demo/data.js';
	import { demo } from '#lib/demo/store.svelte.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const nav = [
		{ href: resolve('/demo/(app)'), label: 'Overzicht', icon: 'home' },
		{ href: resolve('/demo/(app)/prikbord'), label: 'Prikbord', icon: 'board' },
		{ href: resolve('/demo/(app)/chat'), label: 'Chat', icon: 'chat' },
		{ href: resolve('/demo/(app)/agenda'), label: 'Agenda', icon: 'calendar' },
		{ href: resolve('/demo/(app)/uitleen'), label: 'Uitleenhoek', icon: 'box' }
	] as const;

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		return href === resolve('/demo/(app)') ? path === href : path.startsWith(href);
	}
</script>

<DemoBar />

<a class="skip" href="#inhoud">Naar de inhoud</a>

<div class="shell">
	<aside class="side">
		<a class="brand" href={resolve('/demo/(app)')}>
			<Logo size={30} />
			<span>{group.name}</span>
		</a>
		<nav aria-label="Hoofdmenu">
			<ul>
				{#each nav as item (item.href)}
					<li>
						<a
							href={item.href}
							aria-current={isActive(item.href) ? 'page' : undefined}
							class="side-link"
						>
							<Icon name={item.icon} size={20} />
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<div class="channels">
			<p class="eyebrow">Chat</p>
			<ul>
				{#each demo.channels as channel (channel.id)}
					<li>
						<a
							class="side-link small"
							href={resolve('/demo/(app)/chat/[kanaal]', { kanaal: channel.id })}
							aria-current={page.url.pathname.endsWith(`/chat/${channel.id}`) ? 'page' : undefined}
						>
							# {channel.name}
						</a>
					</li>
				{/each}
			</ul>
		</div>
		<p class="foot">Closeknit · open source · gehost in Europa</p>
	</aside>

	<main id="inhoud">
		{@render children()}
	</main>
</div>

<nav class="tabs" aria-label="Hoofdmenu">
	{#each nav as item (item.href)}
		<a href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
			<Icon name={item.icon} />
			<span>{item.label === 'Uitleenhoek' ? 'Uitlenen' : item.label}</span>
		</a>
	{/each}
</nav>

<style>
	.skip {
		position: absolute;
		left: -9999px;
	}

	.skip:focus {
		left: 16px;
		top: 56px;
		z-index: 10;
		padding: 8px 14px;
		background: var(--surface);
		border-radius: 8px;
	}

	.shell {
		display: flex;
		min-height: calc(100svh - 48px);
	}

	.side {
		display: none;
	}

	main {
		flex: 1;
		min-width: 0;
		padding: 0 0 96px;
	}

	.tabs {
		position: fixed;
		inset: auto 0 0 0;
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		padding: 6px 4px calc(10px + env(safe-area-inset-bottom));
		background: var(--surface);
		border-top: 1px solid var(--rule);
		z-index: 5;
	}

	.tabs a {
		min-height: 52px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		font-size: 0.75rem;
		color: var(--muted);
		text-decoration: none;
	}

	.tabs a[aria-current='page'] {
		color: var(--accent);
		font-weight: 600;
	}

	@media (min-width: 900px) {
		.side {
			display: flex;
			flex-direction: column;
			gap: 28px;
			width: 260px;
			flex-shrink: 0;
			padding: 28px 18px;
			background: var(--surface);
			border-right: 1px solid var(--rule);
		}

		.tabs {
			display: none;
		}

		main {
			padding: 0 0 64px;
		}
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--accent);
		text-decoration: none;
	}

	.brand span {
		color: var(--ink);
		font-size: 1.0625rem;
		font-weight: 650;
	}

	.side ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.side-link {
		min-height: 44px;
		padding: 0 12px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--body);
		text-decoration: none;
	}

	.side-link.small {
		min-height: 38px;
		font-size: 0.9375rem;
	}

	.side-link:hover {
		background: color-mix(in srgb, var(--ink) 5%, transparent);
	}

	.side-link[aria-current='page'] {
		background: var(--soft);
		color: var(--ink);
		font-weight: 600;
	}

	.channels .eyebrow {
		padding: 0 12px 6px;
	}

	.foot {
		margin-top: auto;
		padding: 0 12px;
		font-size: 0.8125rem;
		color: var(--muted);
	}
</style>
