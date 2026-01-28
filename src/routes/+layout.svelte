<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import RefreshButton from "$lib/components/dashboard/refresh-button.svelte";
	import ThemeToggle from "$lib/components/ui/theme-toggle.svelte";
	import ShieldCheck from "@lucide/svelte/icons/shield-check";

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-background">
	<header class="border-b bg-card">
		<div class="container mx-auto px-4 py-3 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<ShieldCheck class="size-6 text-primary" />
				<h1 class="text-lg font-semibold">Security Dashboard</h1>
				{#if data.configured && data.repositories.length > 0}
					<span class="text-xs text-muted-foreground hidden sm:inline">
						{data.repositories.length} repo{data.repositories.length === 1 ? "" : "s"}
					</span>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<ThemeToggle />
				<RefreshButton />
			</div>
		</div>
	</header>

	<main class="container mx-auto px-4 py-6">
		{#if !data.configured}
			<div class="rounded-lg border border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 p-6 text-center">
				<h2 class="text-lg font-semibold mb-2">Configuration Required</h2>
				<p class="text-sm text-muted-foreground">
					Set <code class="bg-muted px-1 rounded">GITHUB_PAT</code> and
					<code class="bg-muted px-1 rounded">DASHBOARD_REPOS</code> environment variables
					to get started. See <code class="bg-muted px-1 rounded">.env.example</code> for reference.
				</p>
			</div>
		{:else}
			{@render children()}
		{/if}
	</main>
</div>
