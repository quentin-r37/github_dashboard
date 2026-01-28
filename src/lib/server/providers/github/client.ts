export interface GitHubRateLimit {
	limit: number;
	remaining: number;
	reset: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GhRawAlert = Record<string, any>;

export class GitHubClient {
	private baseUrl = "https://api.github.com";
	private pat: string;
	public lastRateLimit: GitHubRateLimit | null = null;

	constructor(pat: string) {
		this.pat = pat;
	}

	async get<T>(path: string): Promise<T> {
		const res = await fetch(`${this.baseUrl}${path}`, {
			headers: {
				Authorization: `Bearer ${this.pat}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});

		this.lastRateLimit = {
			limit: parseInt(res.headers.get("x-ratelimit-limit") || "0", 10),
			remaining: parseInt(res.headers.get("x-ratelimit-remaining") || "0", 10),
			reset: new Date(
				parseInt(res.headers.get("x-ratelimit-reset") || "0", 10) * 1000
			).toISOString(),
		};

		if (res.status === 403) {
			console.warn(`GitHub API 403 Forbidden: ${path} — check that your PAT has the required scopes (security_events for code scanning)`);
			return [] as T;
		}

		if (res.status === 404) {
			console.warn(`GitHub API 404 Not Found: ${path} — this feature may not be enabled for the repository`);
			return [] as T;
		}

		if (!res.ok) {
			const body = await res.text();
			throw new Error(`GitHub API error ${res.status}: ${body}`);
		}

		return res.json() as Promise<T>;
	}

	async fetchCodeScanningAlerts(repo: string, state?: string): Promise<GhRawAlert[]> {
		const query = state ? `?state=${state}&per_page=100` : "?per_page=100";
		return this.get<GhRawAlert[]>(`/repos/${repo}/code-scanning/alerts${query}`);
	}

	async fetchSecretScanningAlerts(repo: string, state?: string): Promise<GhRawAlert[]> {
		const query = state ? `?state=${state}&per_page=100` : "?per_page=100";
		return this.get<GhRawAlert[]>(`/repos/${repo}/secret-scanning/alerts${query}`);
	}

	async fetchDependabotAlerts(repo: string, state?: string): Promise<GhRawAlert[]> {
		const query = state ? `?state=${state}&per_page=100` : "?per_page=100";
		return this.get<GhRawAlert[]>(`/repos/${repo}/dependabot/alerts${query}`);
	}

	async getRateLimit(): Promise<GitHubRateLimit> {
		await this.get("/rate_limit");
		return this.lastRateLimit!;
	}
}
