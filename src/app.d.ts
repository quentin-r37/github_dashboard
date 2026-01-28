import type { SecurityAlert } from "$lib/types/alerts.js";
import type { KpiSummary } from "$lib/types/kpi.js";

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			repositories: string[];
			configured: boolean;
			alerts?: SecurityAlert[];
			kpi?: KpiSummary;
			fetchedAt?: string;
			error?: string | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
