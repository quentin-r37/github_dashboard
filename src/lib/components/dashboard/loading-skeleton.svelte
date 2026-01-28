<script lang="ts">
	import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>

<div class="space-y-6">
	<div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
		{#each Array(4) as _}
			<Skeleton class="h-24 rounded-xl" />
		{/each}
	</div>
	<Skeleton class="h-10 w-full rounded-md" />
	<div class="space-y-2">
		{#each Array(8) as _}
			<Skeleton class="h-12 w-full rounded-md" />
		{/each}
	</div>
</div>
