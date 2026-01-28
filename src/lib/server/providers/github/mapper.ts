import type { SecurityAlert, AlertSeverity, AlertState } from "$lib/types/alerts.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GhAlert = Record<string, any>;

function normalizeSeverity(raw: string | null | undefined): AlertSeverity {
	const s = (raw || "").toLowerCase();
	if (s === "critical") return "critical";
	if (s === "high") return "high";
	if (s === "medium" || s === "warning") return "medium";
	return "low";
}

function normalizeState(raw: string | null | undefined): AlertState {
	const s = (raw || "").toLowerCase();
	if (s === "fixed" || s === "resolved" || s === "auto_dismissed") return "fixed";
	if (s === "dismissed") return "dismissed";
	return "open";
}

export function mapCodeScanningAlert(alert: GhAlert, repo: string): SecurityAlert {
	const loc = alert.most_recent_instance?.location;
	return {
		id: `github:${repo}:code_scanning:${alert.number}`,
		type: "code_scanning",
		provider: "github",
		repository: repo,
		title: alert.rule?.description || alert.rule?.id || "Code scanning alert",
		description: alert.most_recent_instance?.message?.text || "",
		severity: normalizeSeverity(
			alert.rule?.security_severity_level || alert.rule?.severity
		),
		state: normalizeState(alert.state),
		htmlUrl: alert.html_url || "",
		createdAt: alert.created_at || "",
		updatedAt: alert.updated_at || alert.created_at || "",
		fixedAt: alert.fixed_at || null,
		tool: alert.tool?.name || null,
		target: loc?.path || null,
		ruleId: alert.rule?.id || undefined,
		ruleHelp: alert.rule?.help || undefined,
		ruleTags: alert.rule?.tags?.length ? alert.rule.tags : undefined,
		locationStartLine: loc?.start_line ?? undefined,
		locationEndLine: loc?.end_line ?? undefined,
		locationStartColumn: loc?.start_column ?? undefined,
		locationEndColumn: loc?.end_column ?? undefined,
		classifications: alert.most_recent_instance?.classifications?.length
			? alert.most_recent_instance.classifications
			: undefined,
		instanceRef: alert.most_recent_instance?.ref || undefined,
	};
}

export function mapSecretScanningAlert(alert: GhAlert, repo: string): SecurityAlert {
	return {
		id: `github:${repo}:secret_scanning:${alert.number}`,
		type: "secret_scanning",
		provider: "github",
		repository: repo,
		title: `Exposed secret: ${alert.secret_type_display_name || alert.secret_type || "Unknown"}`,
		description: `Secret of type "${alert.secret_type || "unknown"}" detected`,
		severity: "critical",
		state: normalizeState(alert.state),
		htmlUrl: alert.html_url || "",
		createdAt: alert.created_at || "",
		updatedAt: alert.updated_at || alert.created_at || "",
		fixedAt: alert.resolved_at || null,
		tool: "secret_scanning",
		target: null,
		secretType: alert.secret_type || undefined,
		secretTypeDisplayName: alert.secret_type_display_name || undefined,
		pushProtectionBypassed: alert.push_protection_bypassed ?? undefined,
		pushProtectionBypassedBy: alert.push_protection_bypassed_by?.login || undefined,
		pushProtectionBypassedAt: alert.push_protection_bypassed_at || undefined,
	};
}

export function mapDependabotAlert(alert: GhAlert, repo: string): SecurityAlert {
	const advisory = alert.security_advisory;
	const vulnerability = alert.security_vulnerability;

	return {
		id: `github:${repo}:dependabot:${alert.number}`,
		type: "dependabot",
		provider: "github",
		repository: repo,
		title: advisory?.summary || "Dependabot alert",
		description: advisory?.description || "",
		severity: normalizeSeverity(
			vulnerability?.severity || advisory?.severity
		),
		state: normalizeState(alert.state),
		htmlUrl: alert.html_url || "",
		createdAt: alert.created_at || "",
		updatedAt: alert.updated_at || alert.created_at || "",
		fixedAt: alert.fixed_at || alert.auto_dismissed_at || null,
		tool: "dependabot",
		target: vulnerability?.package?.name || alert.dependency?.package?.name || null,
		cveId: advisory?.cve_id || undefined,
		ghsaId: advisory?.ghsa_id || undefined,
		cvssScore: advisory?.cvss?.score ?? undefined,
		cvssVector: advisory?.cvss?.vector_string || undefined,
		cwes: advisory?.cwes?.length
			? advisory.cwes.map((c: { cwe_id: string }) => c.cwe_id)
			: undefined,
		advisoryReferences: advisory?.references?.length
			? advisory.references.map((r: { url: string }) => r.url)
			: undefined,
		patchedVersion: vulnerability?.first_patched_version?.identifier || undefined,
		vulnerableVersionRange: vulnerability?.vulnerable_version_range || undefined,
		packageName: vulnerability?.package?.name || alert.dependency?.package?.name || undefined,
		packageEcosystem: vulnerability?.package?.ecosystem || alert.dependency?.package?.ecosystem || undefined,
		manifestPath: alert.dependency?.manifest_path || undefined,
	};
}
