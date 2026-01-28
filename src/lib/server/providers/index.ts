import type { SecurityProvider } from "./types.js";
import { GitHubProvider } from "./github/index.js";
import type { DashboardConfig } from "../config.js";

let providerInstance: SecurityProvider | null = null;

export function getProvider(config: DashboardConfig): SecurityProvider {
	if (!providerInstance) {
		providerInstance = new GitHubProvider(config.githubPat, config.cacheTtlSeconds);
	}
	return providerInstance;
}
