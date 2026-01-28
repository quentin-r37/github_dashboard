<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn, type WithoutChild } from "$lib/utils.js";
	import SheetOverlay from "./sheet-overlay.svelte";
	import X from "@lucide/svelte/icons/x";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChild<DialogPrimitive.ContentProps> & {
		children?: Snippet;
	} = $props();
</script>

<DialogPrimitive.Portal>
	<SheetOverlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="sheet-content"
		class={cn(
			"bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex h-full w-3/4 max-w-lg flex-col gap-4 border-l p-6 shadow-lg transition-transform duration-300",
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		<DialogPrimitive.Close
			class="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
		>
			<X class="size-4" />
			<span class="sr-only">Close</span>
		</DialogPrimitive.Close>
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
