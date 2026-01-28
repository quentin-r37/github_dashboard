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
		target: alert.most_recent_instance?.location?.path || null,
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
	};
}
