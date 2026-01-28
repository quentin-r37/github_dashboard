<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import ChevronsLeft from "@lucide/svelte/icons/chevrons-left";
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import ChevronsRight from "@lucide/svelte/icons/chevrons-right";

	interface Props {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		pageSize: number;
		onpagechange: (page: number) => void;
		onpagesizechange: (size: number) => void;
	}

	let { currentPage, totalPages, totalItems, pageSize, onpagechange, onpagesizechange }: Props = $props();

	const pageSizeOptions = [10, 25, 50, 100];

	let rangeStart = $derived(totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1);
	let rangeEnd = $derived(Math.min(currentPage * pageSize, totalItems));

	let visiblePages = $derived.by(() => {
		const pages: (number | "ellipsis")[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
			return pages;
		}

		pages.push(1);

		if (currentPage > 3) {
			pages.push("ellipsis");
		}

		const start = Math.max(2, currentPage - 1);
		const end = Math.min(totalPages - 1, currentPage + 1);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (currentPage < totalPages - 2) {
			pages.push("ellipsis");
		}

		pages.push(totalPages);

		return pages;
	});
</script>

<div class="flex items-center justify-between gap-4 px-2 py-3">
	<p class="text-sm text-muted-foreground whitespace-nowrap">
		Showing {rangeStart}–{rangeEnd} of {totalItems} alert{totalItems === 1 ? "" : "s"}
	</p>

	{#if totalPages > 1}
		<div class="flex items-center gap-1">
			<Button
				variant="outline"
				size="icon-sm"
				disabled={currentPage === 1}
				onclick={() => onpagechange(1)}
				aria-label="First page"
			>
				<ChevronsLeft class="size-4" />
			</Button>
			<Button
				variant="outline"
				size="icon-sm"
				disabled={currentPage === 1}
				onclick={() => onpagechange(currentPage - 1)}
				aria-label="Previous page"
			>
				<ChevronLeft class="size-4" />
			</Button>

			{#each visiblePages as page, i (i)}
				{#if page === "ellipsis"}
					<span class="px-1 text-muted-foreground">…</span>
				{:else}
					<Button
						variant={page === currentPage ? "default" : "outline"}
						size="icon-sm"
						onclick={() => onpagechange(page)}
						aria-label="Page {page}"
						aria-current={page === currentPage ? "page" : undefined}
					>
						{page}
					</Button>
				{/if}
			{/each}

			<Button
				variant="outline"
				size="icon-sm"
				disabled={currentPage === totalPages}
				onclick={() => onpagechange(currentPage + 1)}
				aria-label="Next page"
			>
				<ChevronRight class="size-4" />
			</Button>
			<Button
				variant="outline"
				size="icon-sm"
				disabled={currentPage === totalPages}
				onclick={() => onpagechange(totalPages)}
				aria-label="Last page"
			>
				<ChevronsRight class="size-4" />
			</Button>
		</div>
	{/if}

	<div class="flex items-center gap-2 whitespace-nowrap">
		<span class="text-sm text-muted-foreground">Rows</span>
		<Select.Root
			type="single"
			value={String(pageSize)}
			onValueChange={(v) => {
				if (v) onpagesizechange(Number(v));
			}}
		>
			<Select.Trigger size="sm" class="w-[70px]">
				{pageSize}
			</Select.Trigger>
			<Select.Content>
				{#each pageSizeOptions as size (size)}
					<Select.Item value={String(size)} label={String(size)} />
				{/each}
			</Select.Content>
		</Select.Root>
	</div>
</div>
