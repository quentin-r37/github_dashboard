# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A GitHub security alert dashboard built with SvelteKit and Svelte 5. It aggregates code scanning, secret scanning, and Dependabot alerts from configured GitHub repositories into a unified interface with filtering, sorting, and detail views.

## Commands

- `npm run dev` — Start dev server (runs on HTTPS using local certs in `certs/`)
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run check` — Run svelte-check for TypeScript validation
- `npm run check:watch` — Watch mode for type checking

No test framework is configured. Type checking via `svelte-check` is the only validation.

## Environment Variables

- `GITHUB_PAT` — GitHub Personal Access Token (requires `security_events` scope)
- `DASHBOARD_REPOS` — Comma-separated repos in `owner/repo` format
- `ALERT_CACHE_TTL_SECONDS` — Cache TTL in seconds (default: 300)

See `.env.example` for the template.

## Architecture

### Tech Stack

- **Svelte 5** with runes (`$state`, `$derived`, `$effect`) — not legacy stores
- **SvelteKit 2** with SSR and file-based routing
- **Tailwind CSS v4** via Vite plugin (not PostCSS) with OKLch color system
- **TypeScript** in strict mode
- **shadcn-svelte** component pattern (bits-ui + tailwind-variants)

### Data Flow

1. **Server-side loading**: `+layout.server.ts` loads config and checks health; `+page.server.ts` fetches all alerts and computes KPIs via the provider
2. **Provider pattern**: `SecurityProvider` interface (`src/lib/server/providers/types.ts`) with `GitHubProvider` implementation. Factory singleton via `getProvider()` in `src/lib/server/providers/index.ts`
3. **GitHub API**: `GitHubClient` (`src/lib/server/providers/github/client.ts`) wraps fetch with Bearer auth and rate limit header extraction. Mapper functions normalize GitHub API responses to `SecurityAlert` types
4. **Caching**: In-memory TTL cache (`src/lib/server/cache.ts`) keyed by `github:repo:alertType`. Extends TTL when rate limits are low. Bypass with `?nocache=true`
5. **Client-side**: Filtering and sorting are reactive using Svelte 5 runes — no server round-trips for UI interactions

### Key Directories

- `src/lib/server/` — Server-only code: cache, config, providers (never imported by client)
- `src/lib/server/providers/github/` — GitHub API client, provider implementation, response mappers
- `src/lib/components/dashboard/` — Feature-specific components (alert table, filters, KPI grid, detail panel)
- `src/lib/components/ui/` — Reusable design system components following shadcn-svelte conventions
- `src/lib/types/` — Shared TypeScript types for alerts, API responses, filters, KPIs
- `src/lib/stores/` — Client state (theme store using `$state` rune with localStorage)
- `src/routes/api/` — REST endpoints: `GET /api/alerts` and `GET /api/health`

### API Endpoints

- `GET /api/alerts` — Returns alerts + KPI summary. Params: `nocache=true`, `repositories=owner/repo,...`
- `GET /api/health` — Health check with provider status and rate limit info

### Alert Types

Three GitHub security alert types are supported, each with a dedicated mapper:
- **Code Scanning** — SAST results with rule/severity/location
- **Secret Scanning** — Exposed credentials with secret type and push protection status
- **Dependabot** — Dependency vulnerabilities with CVE, CVSS, CWE, package info

### Conventions

- UI components use the shadcn-svelte pattern: each component in its own directory under `src/lib/components/ui/` with an `index.ts` barrel export
- Class merging uses `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge)
- Markdown content is rendered with `marked` and sanitized with `DOMPurify` to prevent XSS
- Dark mode is handled via CSS class toggle with system preference detection (`src/lib/stores/theme.svelte.ts`)
- Component aliases configured in `components.json`: `$lib/components`, `$lib/components/ui`, `$lib/utils`
