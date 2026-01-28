import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { loadConfig } from "$lib/server/config.js";
import { getProvider } from "$lib/server/providers/index.js";
import type { AlertsResponse } from "$lib/types/api.js";

export const GET: RequestHandler = async ({ url }) => {
	try {
		const config = loadConfig();
		const provider = getProvider(config);
		const nocache = url.searchParams.get("nocache") === "true";

		const reposParam = url.searchParams.get("repositories");
		const repositories = reposParam
			? reposParam.split(",").filter((r) => config.repositories.includes(r))
			: config.repositories;

		const result = await provider.fetchAlerts(repositories, nocache);

		const response: AlertsResponse = {
			alerts: result.alerts,
			kpi: result.kpi,
			fetchedAt: result.fetchedAt,
			repositories: config.repositories,
		};

		return json(response);
	} catch (e) {
		const message = e instanceof Error ? e.message : "Unknown error";
		return json({ error: message }, { status: 500 });
	}
};
