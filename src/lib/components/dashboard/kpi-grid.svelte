<script lang="ts">
	import KpiCard from "./kpi-card.svelte";
	import ShieldAlert from "@lucide/svelte/icons/shield-alert";
	import AlertTriangle from "@lucide/svelte/icons/triangle-alert";
	import TrendingDown from "@lucide/svelte/icons/trending-down";
	import TrendingUp from "@lucide/svelte/icons/trending-up";
	import type { KpiSummary } from "$lib/types/kpi.js";

	interface Props {
		kpi: KpiSummary;
	}

	let { kpi }: Props = $props();
</script>

<div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
	<KpiCard
		title="Total Open"
		value={kpi.totalOpen}
		variant={kpi.totalOpen > 0 ? "default" : "success"}
	>
		{#snippet icon()}
			<ShieldAlert class="size-4 text-muted-foreground" />
		{/snippet}
	</KpiCard>
	<KpiCard
		title="Critical"
		value={kpi.bySeverity.critical}
		variant={kpi.bySeverity.critical > 0 ? "critical" : "default"}
	>
		{#snippet icon()}
			<AlertTriangle class="size-4 text-red-500" />
		{/snippet}
	</KpiCard>
	<KpiCard
		title="New (30d)"
		value={kpi.newLast30Days}
		variant={kpi.newLast30Days > 0 ? "high" : "default"}
	>
		{#snippet icon()}
			<TrendingUp class="size-4 text-orange-500" />
		{/snippet}
	</KpiCard>
	<KpiCard
		title="Fixed (30d)"
		value={kpi.fixedLast30Days}
		variant={kpi.fixedLast30Days > 0 ? "success" : "default"}
	>
		{#snippet icon()}
			<TrendingDown class="size-4 text-green-500" />
		{/snippet}
	</KpiCard>
</div>
