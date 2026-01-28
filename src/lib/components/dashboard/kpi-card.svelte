<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";

	interface Props {
		title: string;
		value: number | string;
		subtitle?: string;
		variant?: "default" | "critical" | "high" | "medium" | "low" | "success";
		icon?: Snippet;
	}

	let { title, value, subtitle, variant = "default", icon }: Props = $props();

	const variantClasses: Record<string, string> = {
		default: "",
		critical: "border-red-500/30 bg-red-50 dark:bg-red-950/20",
		high: "border-orange-500/30 bg-orange-50 dark:bg-orange-950/20",
		medium: "border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20",
		low: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/20",
		success: "border-green-500/30 bg-green-50 dark:bg-green-950/20",
	};

	const valueClasses: Record<string, string> = {
		default: "text-foreground",
		critical: "text-red-600 dark:text-red-400",
		high: "text-orange-600 dark:text-orange-400",
		medium: "text-yellow-600 dark:text-yellow-400",
		low: "text-blue-600 dark:text-blue-400",
		success: "text-green-600 dark:text-green-400",
	};
</script>

<Card class={cn("py-4", variantClasses[variant])}>
	<CardHeader class="pb-0">
		<div class="flex items-center justify-between">
			<CardTitle class="text-sm font-medium text-muted-foreground">{title}</CardTitle>
			{#if icon}
				{@render icon()}
			{/if}
		</div>
	</CardHeader>
	<CardContent class="pt-0">
		<div class={cn("text-2xl font-bold", valueClasses[variant])}>{value}</div>
		{#if subtitle}
			<p class="text-xs text-muted-foreground mt-1">{subtitle}</p>
		{/if}
	</CardContent>
</Card>
