<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { Button } from "$lib/components/ui/button/index.js";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";

	interface Props {
		fetchedAt?: string;
	}

	let { fetchedAt }: Props = $props();
	let loading = $state(false);

	async function refresh() {
		loading = true;
		try {
			await invalidateAll();
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex items-center gap-3">
	{#if fetchedAt}
		<span class="text-xs text-muted-foreground">
			Updated {new Date(fetchedAt).toLocaleTimeString()}
		</span>
	{/if}
	<Button variant="outline" size="sm" onclick={refresh} disabled={loading}>
		<RefreshCw class="size-4 {loading ? 'animate-spin' : ''}" />
		Refresh
	</Button>
</div>
