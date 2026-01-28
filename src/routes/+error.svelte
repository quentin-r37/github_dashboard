<script lang="ts">
	import { page } from "$app/state";
	import AlertTriangle from "@lucide/svelte/icons/triangle-alert";
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<div class="flex items-center justify-center min-h-[60vh]">
	<div class="text-center space-y-4">
		<AlertTriangle class="size-12 text-destructive mx-auto" />
		<h1 class="text-2xl font-bold">{page.status}</h1>
		<p class="text-muted-foreground max-w-md">
			{page.error?.message || "An unexpected error occurred."}
		</p>
		<Button href="/" variant="outline">Back to Dashboard</Button>
	</div>
</div>
