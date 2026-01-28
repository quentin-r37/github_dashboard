import { env } from "$env/dynamic/private";

export interface DashboardConfig {
	githubPat: string;
	repositories: string[];
	cacheTtlSeconds: number;
}

export function loadConfig(): DashboardConfig {
	const pat = env.GITHUB_PAT;
	if (!pat) {
		throw new Error("GITHUB_PAT environment variable is required");
	}

	const reposRaw = env.DASHBOARD_REPOS;
	if (!reposRaw) {
		throw new Error("DASHBOARD_REPOS environment variable is required");
	}

	const repositories = reposRaw
		.split(",")
		.map((r) => r.trim())
		.filter(Boolean);

	if (repositories.length === 0) {
		throw new Error("DASHBOARD_REPOS must contain at least one repository");
	}

	const cacheTtlSeconds = parseInt(env.ALERT_CACHE_TTL_SECONDS || "300", 10);

	return {
		githubPat: pat,
		repositories,
		cacheTtlSeconds,
	};
}
