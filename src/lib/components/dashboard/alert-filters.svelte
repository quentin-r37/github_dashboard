<script lang="ts">
	import * as Select from "$lib/components/ui/select/index.js";
	import Search from "@lucide/svelte/icons/search";
	import X from "@lucide/svelte/icons/x";
	import { Button } from "$lib/components/ui/button/index.js";
	import type { AlertFilters } from "$lib/types/filters.js";
	import type { AlertSeverity, AlertState, AlertType } from "$lib/types/alerts.js";

	interface Props {
		filters: AlertFilters;
		repositories: string[];
		onchange: (filters: AlertFilters) => void;
	}

	let { filters, repositories, onchange }: Props = $props();

	let searchInput = $state("");

	function updateFilter<K extends keyof AlertFilters>(key: K, value: AlertFilters[K]) {
		onchange({ ...filters, [key]: value });
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			updateFilter("search", searchInput);
		}
	}

	function clearFilters() {
		searchInput = "";
		onchange({
			severities: [],
			states: [],
			types: [],
			repositories: [],
			search: "",
		});
	}

	let hasActiveFilters = $derived(
		filters.severities.length > 0 ||
		filters.states.length > 0 ||
		filters.types.length > 0 ||
		filters.repositories.length > 0 ||
		filters.search.length > 0
	);
</script>

<div class="flex flex-wrap items-center gap-3">
	<div class="relative flex-1 min-w-48">
		<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
		<input
			type="text"
			placeholder="Search alerts..."
			class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			bind:value={searchInput}
			onkeydown={handleSearchKeydown}
			oninput={() => updateFilter("search", searchInput)}
		/>
	</div>

	<Select.Root
		type="multiple"
		value={filters.severities}
		onValueChange={(v) => updateFilter("severities", v as AlertSeverity[])}
	>
		<Select.Trigger class="w-36">
			{filters.severities.length > 0 ? `Severity (${filters.severities.length})` : "Severity"}
		</Select.Trigger>
		<Select.Content>
			<Select.Item value="critical" label="Critical" />
			<Select.Item value="high" label="High" />
			<Select.Item value="medium" label="Medium" />
			<Select.Item value="low" label="Low" />
		</Select.Content>
	</Select.Root>

	<Select.Root
		type="multiple"
		value={filters.types}
		onValueChange={(v) => updateFilter("types", v as AlertType[])}
	>
		<Select.Trigger class="w-36">
			{filters.types.length > 0 ? `Type (${filters.types.length})` : "Type"}
		</Select.Trigger>
		<Select.Content>
			<Select.Item value="code_scanning" label="Code Scanning" />
			<Select.Item value="secret_scanning" label="Secret Scanning" />
			<Select.Item value="dependabot" label="Dependabot" />
		</Select.Content>
	</Select.Root>

	<Select.Root
		type="multiple"
		value={filters.states}
		onValueChange={(v) => updateFilter("states", v as AlertState[])}
	>
		<Select.Trigger class="w-32">
			{filters.states.length > 0 ? `State (${filters.states.length})` : "State"}
		</Select.Trigger>
		<Select.Content>
			<Select.Item value="open" label="Open" />
			<Select.Item value="fixed" label="Fixed" />
			<Select.Item value="dismissed" label="Dismissed" />
		</Select.Content>
	</Select.Root>

	{#if repositories.length > 1}
		<Select.Root
			type="multiple"
			value={filters.repositories}
			onValueChange={(v) => updateFilter("repositories", v)}
		>
			<Select.Trigger class="w-44">
				{filters.repositories.length > 0 ? `Repo (${filters.repositories.length})` : "Repository"}
			</Select.Trigger>
			<Select.Content>
				{#each repositories as repo}
					<Select.Item value={repo} label={repo.split("/").pop() || repo} />
				{/each}
			</Select.Content>
		</Select.Root>
	{/if}

	{#if hasActiveFilters}
		<Button variant="ghost" size="sm" onclick={clearFilters}>
			<X class="size-4" />
			Clear
		</Button>
	{/if}
</div>
