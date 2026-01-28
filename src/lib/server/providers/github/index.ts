import type { SecurityAlert, AlertSeverity, AlertType } from "$lib/types/alerts.js";
import type { KpiSummary } from "$lib/types/kpi.js";
import type { SecurityProvider, FetchAlertsResult, HealthCheckResult } from "../types.js";
import { GitHubClient, type GhRawAlert } from "./client.js";
import { mapCodeScanningAlert, mapSecretScanningAlert, mapDependabotAlert } from "./mapper.js";
import { cacheGet, cacheSet, extendTtl } from "../../cache.js";

export class GitHubProvider implements SecurityProvider {
	private client: GitHubClient;
	private cacheTtlSeconds: number;

	constructor(pat: string, cacheTtlSeconds: number) {
		this.client = new GitHubClient(pat);
		this.cacheTtlSeconds = cacheTtlSeconds;
	}

	async fetchAlerts(repositories: string[], nocache = false): Promise<FetchAlertsResult> {
		const allAlerts: SecurityAlert[] = [];

		const tasks = repositories.flatMap((repo) => [
			this.fetchTypedAlerts(repo, "code_scanning", nocache),
			this.fetchTypedAlerts(repo, "secret_scanning", nocache),
			this.fetchTypedAlerts(repo, "dependabot", nocache),
		]);

		const results = await Promise.allSettled(tasks);

		for (const result of results) {
			if (result.status === "fulfilled") {
				allAlerts.push(...result.value);
			} else {
				console.error("Failed to fetch alerts:", result.reason);
			}
		}

		// Extend TTL if rate limit is low
		if (this.client.lastRateLimit && this.client.lastRateLimit.remaining < 100) {
			for (const repo of repositories) {
				for (const type of ["code_scanning", "secret_scanning", "dependabot"]) {
					extendTtl(`github:${repo}:${type}`, this.cacheTtlSeconds);
				}
			}
		}

		const kpi = this.computeKpi(allAlerts);

		return {
			alerts: allAlerts,
			kpi,
			fetchedAt: new Date().toISOString(),
		};
	}

	private async fetchTypedAlerts(
		repo: string,
		type: "code_scanning" | "secret_scanning" | "dependabot",
		nocache: boolean
	): Promise<SecurityAlert[]> {
		const cacheKey = `github:${repo}:${type}`;

		if (!nocache) {
			const cached = cacheGet<SecurityAlert[]>(cacheKey);
			if (cached) return cached;
		}

		let raw: GhRawAlert[];
		switch (type) {
			case "code_scanning":
				raw = await this.client.fetchCodeScanningAlerts(repo);
				break;
			case "secret_scanning":
				raw = await this.client.fetchSecretScanningAlerts(repo);
				break;
			case "dependabot":
				raw = await this.client.fetchDependabotAlerts(repo);
				break;
		}

		if (!Array.isArray(raw)) {
			raw = [];
		}

		let alerts: SecurityAlert[];
		switch (type) {
			case "code_scanning":
				alerts = raw.map((a) => mapCodeScanningAlert(a, repo));
				break;
			case "secret_scanning":
				alerts = raw.map((a) => mapSecretScanningAlert(a, repo));
				break;
			case "dependabot":
				alerts = raw.map((a) => mapDependabotAlert(a, repo));
				break;
		}

		cacheSet(cacheKey, alerts, this.cacheTtlSeconds);
		return alerts;
	}

	private computeKpi(alerts: SecurityAlert[]): KpiSummary {
		const now = Date.now();
		const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

		const openAlerts = alerts.filter((a) => a.state === "open");

		const bySeverity: Record<AlertSeverity, number> = {
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
		};

		const byType: Record<AlertType, number> = {
			code_scanning: 0,
			secret_scanning: 0,
			dependabot: 0,
		};

		const byRepo: Record<string, number> = {};

		for (const alert of openAlerts) {
			bySeverity[alert.severity]++;
			byType[alert.type]++;
			byRepo[alert.repository] = (byRepo[alert.repository] || 0) + 1;
		}

		const fixedLast30Days = alerts.filter(
			(a) => a.fixedAt && new Date(a.fixedAt).getTime() > thirtyDaysAgo
		).length;

		const newLast30Days = alerts.filter(
			(a) => new Date(a.createdAt).getTime() > thirtyDaysAgo
		).length;

		return {
			totalOpen: openAlerts.length,
			bySeverity,
			byType,
			byRepo,
			fixedLast30Days,
			newLast30Days,
		};
	}

	async healthCheck(): Promise<HealthCheckResult> {
		try {
			const rateLimit = await this.client.getRateLimit();
			return {
				status: "ok",
				provider: "github",
				configuredRepos: [],
				rateLimit,
			};
		} catch (e) {
			return {
				status: "error",
				provider: "github",
				configuredRepos: [],
				error: e instanceof Error ? e.message : String(e),
			};
		}
	}
}
