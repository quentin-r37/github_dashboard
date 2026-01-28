<script lang="ts">
	import KpiGrid from "$lib/components/dashboard/kpi-grid.svelte";
	import AlertFilters from "$lib/components/dashboard/alert-filters.svelte";
	import AlertTable from "$lib/components/dashboard/alert-table.svelte";
	import AlertDetailPanel from "$lib/components/dashboard/alert-detail-panel.svelte";
	import AlertTriangle from "@lucide/svelte/icons/triangle-alert";
	import type { AlertFilters as AlertFiltersType } from "$lib/types/filters.js";
	import type { SortConfig } from "$lib/types/filters.js";
	import type { AlertSeverity, SecurityAlert } from "$lib/types/alerts.js";
	import type { KpiSummary } from "$lib/types/kpi.js";

	let { data } = $props();

	const defaultKpi: KpiSummary = {
		totalOpen: 0,
		bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
		byType: { code_scanning: 0, secret_scanning: 0, dependabot: 0 },
		byRepo: {},
		fixedLast30Days: 0,
		newLast30Days: 0,
	};

	let kpi = $derived(data.kpi ?? defaultKpi);

	let filters = $state<AlertFiltersType>({
		severities: [],
		states: [],
		types: [],
		repositories: [],
		search: "",
	});

	let sort = $state<SortConfig>({
		field: "severity",
		direction: "asc",
	});

	let selectedAlert = $state<SecurityAlert | null>(null);
	let detailOpen = $state(false);

	function handleSelectAlert(alert: SecurityAlert) {
		selectedAlert = alert;
		detailOpen = true;
	}

	const severityOrder: Record<AlertSeverity, number> = {
		critical: 0,
		high: 1,
		medium: 2,
		low: 3,
	};

	let filteredAlerts = $derived.by(() => {
		let result = data.alerts ?? [];

		if (filters.severities.length > 0) {
			result = result.filter((a) => filters.severities.includes(a.severity));
		}
		if (filters.states.length > 0) {
			result = result.filter((a) => filters.states.includes(a.state));
		}
		if (filters.types.length > 0) {
			result = result.filter((a) => filters.types.includes(a.type));
		}
		if (filters.repositories.length > 0) {
			result = result.filter((a) => filters.repositories.includes(a.repository));
		}
		if (filters.search) {
			const q = filters.search.toLowerCase();
			result = result.filter(
				(a) =>
					a.title.toLowerCase().includes(q) ||
					a.description.toLowerCase().includes(q) ||
					(a.target && a.target.toLowerCase().includes(q)) ||
					a.repository.toLowerCase().includes(q)
			);
		}

		result = [...result].sort((a, b) => {
			let cmp = 0;
			switch (sort.field) {
				case "severity":
					cmp = severityOrder[a.severity] - severityOrder[b.severity];
					break;
				case "createdAt":
					cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					break;
				case "updatedAt":
					cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
					break;
				case "repository":
					cmp = a.repository.localeCompare(b.repository);
					break;
				case "type":
					cmp = a.type.localeCompare(b.type);
					break;
				case "title":
					cmp = a.title.localeCompare(b.title);
					break;
			}
			return sort.direction === "desc" ? -cmp : cmp;
		});

		return result;
	});
</script>

<svelte:head>
	<title>Security Dashboard</title>
</svelte:head>

<div class="space-y-6">
	{#if data.error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
			<AlertTriangle class="size-5 text-destructive shrink-0 mt-0.5" />
			<div>
				<p class="font-medium text-destructive">Failed to load alerts</p>
				<p class="text-sm text-muted-foreground mt-1">{data.error}</p>
			</div>
		</div>
	{/if}

	<KpiGrid {kpi} />

	<AlertFilters
		{filters}
		repositories={data.repositories ?? []}
		onchange={(f) => (filters = f)}
	/>

	<AlertTable
		alerts={filteredAlerts}
		{sort}
		onsort={(s) => (sort = s)}
		onselect={handleSelectAlert}
	/>
</div>

<AlertDetailPanel
	alert={selectedAlert}
	open={detailOpen}
	onclose={() => { detailOpen = false; }}
/>
