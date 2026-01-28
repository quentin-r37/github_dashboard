# GitHub Security Dashboard

A dashboard that aggregates code scanning, secret scanning, and Dependabot alerts from your GitHub repositories into a unified interface.

Built with SvelteKit, Svelte 5, and Tailwind CSS v4.

![Dashboard screenshot](static/Macbook-Air-localhost.png)

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in:

```
GITHUB_PAT=<your token with security_events scope>
DASHBOARD_REPOS=owner/repo1,owner/repo2
ALERT_CACHE_TTL_SECONDS=300
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## License

[MIT](LICENSE)
