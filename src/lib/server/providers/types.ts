import type { SecurityAlert } from "$lib/types/alerts.js";
import type { KpiSummary } from "$lib/types/kpi.js";

export interface FetchAlertsResult {
	alerts: SecurityAlert[];
	kpi: KpiSummary;
	fetchedAt: string;
}

export interface HealthCheckResult {
	status: "ok" | "error";
	provider: string;
	configuredRepos: string[];
	rateLimit?: {
		limit: number;
		remaining: number;
		reset: string;
	};
	error?: string;
}

export interface SecurityProvider {
	fetchAlerts(repositories: string[], nocache?: boolean): Promise<FetchAlertsResult>;
	healthCheck(): Promise<HealthCheckResult>;
}
