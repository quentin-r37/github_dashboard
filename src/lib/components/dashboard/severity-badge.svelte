<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import type { AlertSeverity } from "$lib/types/alerts.js";

	interface Props {
		severity: AlertSeverity;
	}

	let { severity }: Props = $props();

	const config: Record<AlertSeverity, { label: string; class: string }> = {
		critical: { label: "Critical", class: "bg-red-600 text-white border-transparent hover:bg-red-700" },
		high: { label: "High", class: "bg-orange-500 text-white border-transparent hover:bg-orange-600" },
		medium: { label: "Medium", class: "bg-yellow-500 text-white border-transparent hover:bg-yellow-600" },
		low: { label: "Low", class: "bg-blue-500 text-white border-transparent hover:bg-blue-600" },
	};
</script>

<Badge class={config[severity].class}>{config[severity].label}</Badge>
