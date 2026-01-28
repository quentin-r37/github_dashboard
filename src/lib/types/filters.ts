import type { AlertSeverity, AlertState, AlertType } from "./alerts.js";

export interface AlertFilters {
	severities: AlertSeverity[];
	states: AlertState[];
	types: AlertType[];
	repositories: string[];
	search: string;
}

export type SortField = "severity" | "createdAt" | "updatedAt" | "repository" | "type" | "title";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
	field: SortField;
	direction: SortDirection;
}
