export type AlertType = "code_scanning" | "secret_scanning" | "dependabot";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type AlertState = "open" | "fixed" | "dismissed";

export type ProviderType = "github" | "azure_devops";

export interface SecurityAlert {
	id: string;
	type: AlertType;
	provider: ProviderType;
	repository: string;
	title: string;
	description: string;
	severity: AlertSeverity;
	state: AlertState;
	htmlUrl: string;
	createdAt: string;
	updatedAt: string;
	fixedAt: string | null;
	tool: string | null;
	target: string | null;
}
