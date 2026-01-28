import type { PageServerLoad } from "./$types.js";
import { loadConfig } from "$lib/server/config.js";
import { getProvider } from "$lib/server/providers/index.js";
import type { SecurityAlert } from "$lib/types/alerts.js";
import type { KpiSummary } from "$lib/types/kpi.js";

export const load: PageServerLoad = async () => {
	try {
		const config = loadConfig();
		const provider = getProvider(config);
		const result = await provider.fetchAlerts(config.repositories);

		return {
			alerts: result.alerts,
			kpi: result.kpi,
			fetchedAt: result.fetchedAt,
			error: null,
		};
	} catch (e) {
		const emptyKpi: KpiSummary = {
			totalOpen: 0,
			bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
			byType: { code_scanning: 0, secret_scanning: 0, dependabot: 0 },
			byRepo: {},
			fixedLast30Days: 0,
			newLast30Days: 0,
		};

		return {
			alerts: [] as SecurityAlert[],
			kpi: emptyKpi,
			fetchedAt: new Date().toISOString(),
			error: e instanceof Error ? e.message : "Failed to load alerts",
		};
	}
};
