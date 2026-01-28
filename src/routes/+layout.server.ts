import type { LayoutServerLoad } from "./$types.js";
import { loadConfig } from "$lib/server/config.js";

export const load: LayoutServerLoad = () => {
	try {
		const config = loadConfig();
		return {
			repositories: config.repositories,
			configured: true,
		};
	} catch {
		return {
			repositories: [] as string[],
			configured: false,
		};
	}
};
