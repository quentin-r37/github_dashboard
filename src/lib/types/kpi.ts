import type { AlertSeverity, AlertType } from "./alerts.js";

export interface KpiSummary {
	totalOpen: number;
	bySeverity: Record<AlertSeverity, number>;
	byType: Record<AlertType, number>;
	byRepo: Record<string, number>;
	fixedLast30Days: number;
	newLast30Days: number;
}
