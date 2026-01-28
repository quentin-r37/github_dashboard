import type { SecurityAlert } from "./alerts.js";
import type { KpiSummary } from "./kpi.js";

export interface AlertsResponse {
	alerts: SecurityAlert[];
	kpi: KpiSummary;
	fetchedAt: string;
	repositories: string[];
}

export interface HealthResponse {
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
