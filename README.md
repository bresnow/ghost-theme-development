# Ghost Docker Dev

Multi-theme Ghost CMS development environment using Docker, pnpm workspaces, and Vite.

## Prerequisites

- **Docker Desktop** (or Docker Engine + Compose plugin)
- **pnpm v8+** (`npm install -g pnpm` or `corepack enable`)
- **Node.js 20+**

## Quick Start

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm dev:theme-one
```

## First-Run Steps (required once)

1. Wait ~30 seconds for MySQL to initialize
   - Check: `docker compose logs -f db` — wait for "ready for connections"
2. Visit http://localhost:2380/ghost
3. Complete the Ghost setup wizard (create your admin account)
4. Settings > Design > Change theme > Activate **theme-one**
5. Visit http://localhost:2380 — your theme is live

## Development Commands

| Command | What it does |
|---|---|
| `pnpm dev:source` | Watch + rebuild Source theme assets only |
| `pnpm dev:theme-one` | Watch + rebuild theme-one assets only |
| `pnpm dev:theme-two` | Watch + rebuild theme-two assets only |
| `pnpm dev` | Watch + rebuild all themes in parallel |
| `pnpm build` | Production build all themes |
| `pnpm lint:theme-one` | Run gscan on theme-one |
| `pnpm lint` | Run gscan on all themes |
| `docker compose logs -f ghost` | Tail Ghost logs |
| `docker compose down` | Stop (data persists in named volumes) |
| `docker compose down -v` | Stop AND delete all volume data |

## Themes

| Theme | Description |
|---|---|
| **Source** | Ghost's default theme, migrated from Gulp to Vite |
| **theme-one** | Starter theme with blue/teal palette |
| **theme-two** | Starter theme with warm orange/coral palette |

## Adding a New Theme

See [docs/THEME-DEVELOPMENT.md](docs/THEME-DEVELOPMENT.md) for step-by-step instructions.

## Building for Production

```bash
pnpm build:theme-one
# Upload assets/built/ contents or package as a zip for Ghost Admin
```

## Environment

The `.env` file contains dev-only database credentials and is gitignored. Copy from `.env.example` to get started. **Never use these credentials in production.**

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed explanations of every technology decision.

## Troubleshooting

- **Ghost fails to start / can't connect to db:** MySQL is still initializing. Check `docker compose logs db`. The healthcheck retries 10x over ~90 seconds.
- **Theme not appearing in Ghost Admin:** Verify the bind mount path in docker-compose.yml matches the directory name under `themes/`. Restart ghost: `docker compose restart ghost`
- **CSS/JS changes not reflected:** Confirm `pnpm dev:theme-name` is running and Vite is rebuilding (watch its terminal output). Check that `assets/built/` is populated.
- **gscan errors:** Check [docs/THEME-DEVELOPMENT.md](docs/THEME-DEVELOPMENT.md) for required .hbs files. The most common error is a missing `error.hbs` or invalid `{{content}}` usage.
