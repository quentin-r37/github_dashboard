import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { loadConfig } from "$lib/server/config.js";
import { getProvider } from "$lib/server/providers/index.js";
import type { HealthResponse } from "$lib/types/api.js";

export const GET: RequestHandler = async () => {
	try {
		const config = loadConfig();
		const provider = getProvider(config);

		const health = await provider.healthCheck();

		const response: HealthResponse = {
			...health,
			configuredRepos: config.repositories,
		};

		return json(response);
	} catch (e) {
		const message = e instanceof Error ? e.message : "Unknown error";
		const response: HealthResponse = {
			status: "error",
			provider: "github",
			configuredRepos: [],
			error: message,
		};
		return json(response, { status: 500 });
	}
};
