<script lang="ts">
	import ShieldAlert from "@lucide/svelte/icons/shield-alert";
	import KeyRound from "@lucide/svelte/icons/key-round";
	import Package from "@lucide/svelte/icons/package";
	import type { AlertType } from "$lib/types/alerts.js";

	interface Props {
		type: AlertType;
		class?: string;
	}

	let { type, class: className = "size-4" }: Props = $props();
</script>

{#if type === "code_scanning"}
	<ShieldAlert class={className} />
{:else if type === "secret_scanning"}
	<KeyRound class={className} />
{:else}
	<Package class={className} />
{/if}
