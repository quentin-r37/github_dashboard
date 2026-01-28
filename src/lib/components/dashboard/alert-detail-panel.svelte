<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import SeverityBadge from "./severity-badge.svelte";
	import AlertTypeIcon from "./alert-type-icon.svelte";
	import ExternalLink from "@lucide/svelte/icons/external-link";
	import Check from "@lucide/svelte/icons/check";
	import BotMessageSquare from "@lucide/svelte/icons/bot-message-square";
	import { marked } from "marked";
	import DOMPurify from "dompurify";
	import type { SecurityAlert } from "$lib/types/alerts.js";

	function renderMarkdown(md: string): string {
		return DOMPurify.sanitize(marked.parse(md, { async: false }) as string);
	}

	interface Props {
		alert: SecurityAlert | null;
		open: boolean;
		onclose: () => void;
	}

	let { alert, open, onclose }: Props = $props();

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

	function formatDate(iso: string | null | undefined): string {
		if (!iso) return "-";
		return new Date(iso).toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	}

	function formatLocation(a: SecurityAlert): string | null {
		if (!a.target) return null;
		let loc = a.target;
		if (a.locationStartLine) {
			loc += `:${a.locationStartLine}`;
			if (a.locationEndLine && a.locationEndLine !== a.locationStartLine) {
				loc += `-${a.locationEndLine}`;
			}
		}
		return loc;
	}

	let copied = $state(false);

	function buildFixPrompt(a: SecurityAlert): string {
		const repo = a.repository;
		switch (a.type) {
			case "code_scanning": {
				const loc = formatLocation(a) || a.target || "unknown location";
				const rule = a.ruleId ? ` (${a.ruleId})` : "";
				return `Fix the ${a.severity} security issue "${a.title}"${rule} in ${repo} at ${loc}.`;
			}
			case "secret_scanning": {
				const secret = a.secretTypeDisplayName || a.secretType || "secret";
				const file = a.target ? ` in ${a.target}` : "";
				return `Remove the exposed ${secret}${file} in ${repo} and rotate the credential.`;
			}
			case "dependabot": {
				const pkg = a.packageName || "the vulnerable dependency";
				const patch = a.patchedVersion ? ` to ${a.patchedVersion}` : "";
				const vuln = a.cveId || a.ghsaId || "";
				const vulnSuffix = vuln ? ` to fix ${vuln}` : "";
				return `Update ${pkg}${patch} in ${repo}${vulnSuffix}.`;
			}
			default:
				return `Fix the ${a.severity} security alert "${a.title}" in ${repo}.`;
		}
	}

	async function copyPrompt() {
		if (!alert) return;
		const prompt = buildFixPrompt(alert);
		await navigator.clipboard.writeText(prompt);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<Sheet.Root
	bind:open
	onOpenChange={(v) => { if (!v) onclose(); }}
>
	<Sheet.Content>
		{#if alert}
			<!-- Header -->
			<Sheet.Header>
				<div class="flex items-center gap-2">
					<AlertTypeIcon type={alert.type} class="size-5" />
					<Sheet.Title class="leading-tight">{alert.title}</Sheet.Title>
				</div>
				<Sheet.Description>
					{alert.repository} &middot; {typeLabels[alert.type]}
				</Sheet.Description>
			</Sheet.Header>

			<!-- Status bar -->
			<div class="flex items-center gap-2 flex-wrap">
				<SeverityBadge severity={alert.severity} />
				<Badge variant={stateVariants[alert.state] || "outline"}>
					{alert.state}
				</Badge>
				{#if alert.htmlUrl}
					<a
						href={alert.htmlUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						View on GitHub
						<ExternalLink class="size-3.5" />
					</a>
				{/if}
			</div>

			<Separator />

			<!-- Common details -->
			<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
				{#if alert.tool}
					<dt class="text-muted-foreground">Tool</dt>
					<dd>{alert.tool}</dd>
				{/if}
				{#if alert.target}
					<dt class="text-muted-foreground">Target</dt>
					<dd class="break-all">{alert.target}</dd>
				{/if}
				<dt class="text-muted-foreground">Created</dt>
				<dd>{formatDate(alert.createdAt)}</dd>
				<dt class="text-muted-foreground">Updated</dt>
				<dd>{formatDate(alert.updatedAt)}</dd>
				{#if alert.fixedAt}
					<dt class="text-muted-foreground">Fixed</dt>
					<dd>{formatDate(alert.fixedAt)}</dd>
				{/if}
			</dl>

			<Separator />

			<!-- Type-specific section -->
			{#if alert.type === "code_scanning"}
				<div class="space-y-3">
					<h3 class="text-sm font-medium">Code Scanning Details</h3>
					<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
						{#if alert.ruleId}
							<dt class="text-muted-foreground">Rule ID</dt>
							<dd class="font-mono text-xs">{alert.ruleId}</dd>
						{/if}
						{#if formatLocation(alert)}
							<dt class="text-muted-foreground">Location</dt>
							<dd class="font-mono text-xs break-all">{formatLocation(alert)}</dd>
						{/if}
						{#if alert.classifications?.length}
							<dt class="text-muted-foreground">Classifications</dt>
							<dd class="flex flex-wrap gap-1">
								{#each alert.classifications as cls}
									<Badge variant="outline" class="text-xs">{cls}</Badge>
								{/each}
							</dd>
						{/if}
						{#if alert.ruleTags?.length}
							<dt class="text-muted-foreground">Tags</dt>
							<dd class="flex flex-wrap gap-1">
								{#each alert.ruleTags as tag}
									<Badge variant="secondary" class="text-xs">{tag}</Badge>
								{/each}
							</dd>
						{/if}
						{#if alert.instanceRef}
							<dt class="text-muted-foreground">Branch</dt>
							<dd class="text-xs">{alert.instanceRef}</dd>
						{/if}
					</dl>
					{#if alert.ruleHelp}
						<div class="mt-3">
							<h4 class="text-sm font-medium text-muted-foreground mb-1">Rule Help</h4>
							<div class="prose prose-sm dark:prose-invert max-w-none">
								{@html renderMarkdown(alert.ruleHelp)}
							</div>
						</div>
					{/if}
				</div>
			{:else if alert.type === "secret_scanning"}
				<div class="space-y-3">
					<h3 class="text-sm font-medium">Secret Scanning Details</h3>
					<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
						{#if alert.secretTypeDisplayName || alert.secretType}
							<dt class="text-muted-foreground">Secret Type</dt>
							<dd>{alert.secretTypeDisplayName || alert.secretType}</dd>
						{/if}
						{#if alert.pushProtectionBypassed !== undefined}
							<dt class="text-muted-foreground">Push Protection Bypassed</dt>
							<dd>
								{alert.pushProtectionBypassed ? "Yes" : "No"}
								{#if alert.pushProtectionBypassedBy}
									by {alert.pushProtectionBypassedBy}
								{/if}
								{#if alert.pushProtectionBypassedAt}
									on {formatDate(alert.pushProtectionBypassedAt)}
								{/if}
							</dd>
						{/if}
					</dl>
				</div>
			{:else if alert.type === "dependabot"}
				<div class="space-y-3">
					<h3 class="text-sm font-medium">Dependabot Details</h3>
					<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
						{#if alert.cveId}
							<dt class="text-muted-foreground">CVE</dt>
							<dd class="font-mono text-xs">{alert.cveId}</dd>
						{/if}
						{#if alert.ghsaId}
							<dt class="text-muted-foreground">GHSA</dt>
							<dd class="font-mono text-xs">{alert.ghsaId}</dd>
						{/if}
						{#if alert.cvssScore !== undefined}
							<dt class="text-muted-foreground">CVSS Score</dt>
							<dd>
								<span class="font-semibold">{alert.cvssScore}</span>
								{#if alert.cvssVector}
									<span class="text-xs text-muted-foreground ml-1">({alert.cvssVector})</span>
								{/if}
							</dd>
						{/if}
						{#if alert.cwes?.length}
							<dt class="text-muted-foreground">CWEs</dt>
							<dd class="flex flex-wrap gap-1">
								{#each alert.cwes as cwe}
									<Badge variant="outline" class="text-xs">{cwe}</Badge>
								{/each}
							</dd>
						{/if}
						{#if alert.packageName}
							<dt class="text-muted-foreground">Package</dt>
							<dd>
								{alert.packageName}
								{#if alert.packageEcosystem}
									<span class="text-xs text-muted-foreground">({alert.packageEcosystem})</span>
								{/if}
							</dd>
						{/if}
						{#if alert.vulnerableVersionRange}
							<dt class="text-muted-foreground">Vulnerable Range</dt>
							<dd class="font-mono text-xs">{alert.vulnerableVersionRange}</dd>
						{/if}
						{#if alert.patchedVersion}
							<dt class="text-muted-foreground">Patched Version</dt>
							<dd class="font-mono text-xs">{alert.patchedVersion}</dd>
						{/if}
						{#if alert.manifestPath}
							<dt class="text-muted-foreground">Manifest</dt>
							<dd class="font-mono text-xs break-all">{alert.manifestPath}</dd>
						{/if}
					</dl>
					{#if alert.advisoryReferences?.length}
						<div class="mt-2">
							<h4 class="text-sm font-medium text-muted-foreground mb-1">Advisory References</h4>
							<ul class="space-y-1">
								{#each alert.advisoryReferences as url}
									<li>
										<a
											href={url}
											target="_blank"
											rel="noopener noreferrer"
											class="text-xs text-muted-foreground hover:text-foreground transition-colors underline break-all"
										>
											{url}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Description -->
			{#if alert.description}
				<Separator />
				<div>
					<h3 class="text-sm font-medium mb-1">Description</h3>
					<p class="text-sm text-muted-foreground whitespace-pre-wrap">{alert.description}</p>
				</div>
			{/if}

			<!-- Fix prompt floating button -->
			<div class="sticky bottom-0 pt-4 mt-auto">
				<button
					onclick={copyPrompt}
					class="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium shadow-lg hover:bg-primary/90 transition-colors cursor-pointer"
				>
					{#if copied}
						<Check class="size-4" />
						Copied!
					{:else}
						<BotMessageSquare class="size-4" />
						Copy fix prompt
					{/if}
				</button>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
