<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { getTheme, toggleTheme } from "$lib/stores/theme.svelte.js";
	import Sun from "@lucide/svelte/icons/sun";
	import Moon from "@lucide/svelte/icons/moon";
	import Monitor from "@lucide/svelte/icons/monitor";

	const labels: Record<string, string> = {
		light: "Light mode (click for system)",
		dark: "Dark mode (click for light)",
		system: "System theme (click for dark)",
	};
</script>

<Button variant="ghost" size="icon" onclick={toggleTheme} aria-label={labels[getTheme()]}>
	{#if getTheme() === "light"}
		<Sun class="size-4" />
	{:else if getTheme() === "dark"}
		<Moon class="size-4" />
	{:else}
		<Monitor class="size-4" />
	{/if}
</Button>
