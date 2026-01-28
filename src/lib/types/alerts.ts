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

	// Code scanning details
	ruleId?: string;
	ruleHelp?: string;
	ruleTags?: string[];
	locationStartLine?: number;
	locationEndLine?: number;
	locationStartColumn?: number;
	locationEndColumn?: number;
	classifications?: string[];
	instanceRef?: string;

	// Secret scanning details
	secretType?: string;
	secretTypeDisplayName?: string;
	pushProtectionBypassed?: boolean;
	pushProtectionBypassedBy?: string;
	pushProtectionBypassedAt?: string;

	// Dependabot details
	cveId?: string;
	ghsaId?: string;
	cvssScore?: number;
	cvssVector?: string;
	cwes?: string[];
	advisoryReferences?: string[];
	patchedVersion?: string;
	vulnerableVersionRange?: string;
	packageName?: string;
	packageEcosystem?: string;
	manifestPath?: string;
}
