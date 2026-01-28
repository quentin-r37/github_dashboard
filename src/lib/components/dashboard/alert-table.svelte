<script lang="ts">
	import * as Table from "$lib/components/ui/table/index.js";
	import SeverityBadge from "./severity-badge.svelte";
	import AlertTypeIcon from "./alert-type-icon.svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import ExternalLink from "@lucide/svelte/icons/external-link";
	import ArrowUpDown from "@lucide/svelte/icons/arrow-up-down";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";
	import ArrowDown from "@lucide/svelte/icons/arrow-down";
	import type { SecurityAlert } from "$lib/types/alerts.js";
	import type { SortConfig, SortField } from "$lib/types/filters.js";

	interface Props {
		alerts: SecurityAlert[];
		sort: SortConfig;
		onsort: (sort: SortConfig) => void;
		onselect?: (alert: SecurityAlert) => void;
	}

	let { alerts, sort, onsort, onselect }: Props = $props();

	function handleSort(field: SortField) {
		if (sort.field === field) {
			onsort({ field, direction: sort.direction === "asc" ? "desc" : "asc" });
		} else {
			onsort({ field, direction: "asc" });
		}
	}

	const typeLabels: Record<string, string> = {
		code_scanning: "Code Scanning",
		secret_scanning: "Secret Scanning",
		dependabot: "Dependabot",
	};

	const stateVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
		open: "destructive",
		fixed: "default",
		dismissed: "secondary",
	};

	function formatDate(iso: string): string {
		if (!iso) return "-";
		return new Date(iso).toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	}
</script>

{#snippet sortIcon(field: SortField)}
	{#if sort.field === field}
		{#if sort.direction === "asc"}
			<ArrowUp class="size-3" />
		{:else}
			<ArrowDown class="size-3" />
		{/if}
	{:else}
		<ArrowUpDown class="size-3 opacity-40" />
	{/if}
{/snippet}

{#snippet sortableHeader(field: SortField, label: string)}
	<button
		class="flex items-center gap-1 hover:text-foreground transition-colors"
		onclick={() => handleSort(field)}
	>
		{label}
		{@render sortIcon(field)}
	</button>
{/snippet}

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-10"></Table.Head>
				<Table.Head>
					{@render sortableHeader("title", "Title")}
				</Table.Head>
				<Table.Head>
					{@render sortableHeader("severity", "Severity")}
				</Table.Head>
				<Table.Head>
					{@render sortableHeader("type", "Type")}
				</Table.Head>
				<Table.Head>
					{@render sortableHeader("repository", "Repository")}
				</Table.Head>
				<Table.Head>State</Table.Head>
				<Table.Head>
					{@render sortableHeader("createdAt", "Created")}
				</Table.Head>
				<Table.Head class="w-10"></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if alerts.length === 0}
				<Table.Row>
					<Table.Cell colspan={8} class="h-24 text-center text-muted-foreground">
						No alerts found.
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each alerts as alert (alert.id)}
					<Table.Row
						class="cursor-pointer hover:bg-muted/50"
						onclick={() => onselect?.(alert)}
					>
						<Table.Cell>
							<AlertTypeIcon type={alert.type} />
						</Table.Cell>
						<Table.Cell class="max-w-sm">
							<div class="font-medium truncate" title={alert.title}>{alert.title}</div>
							{#if alert.target}
								<div class="text-xs text-muted-foreground truncate" title={alert.target}>
									{alert.target}
								</div>
							{/if}
						</Table.Cell>
						<Table.Cell>
							<SeverityBadge severity={alert.severity} />
						</Table.Cell>
						<Table.Cell>
							<span class="text-sm text-muted-foreground">{typeLabels[alert.type]}</span>
						</Table.Cell>
						<Table.Cell>
							<span class="text-sm">{alert.repository.split("/").pop()}</span>
						</Table.Cell>
						<Table.Cell>
							<Badge variant={stateVariants[alert.state] || "outline"}>
								{alert.state}
							</Badge>
						</Table.Cell>
						<Table.Cell class="text-sm text-muted-foreground">
							{formatDate(alert.createdAt)}
						</Table.Cell>
						<Table.Cell>
							{#if alert.htmlUrl}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<a
									href={alert.htmlUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="text-muted-foreground hover:text-foreground transition-colors"
									onclick={(e) => e.stopPropagation()}
								>
									<ExternalLink class="size-4" />
								</a>
							{/if}
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
