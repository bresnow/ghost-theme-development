# Ghost Docker Dev

Multi-theme Ghost CMS development environment using Docker, pnpm workspaces, and Vite.

## Prerequisites

- **Docker Desktop** (or Docker Engine + Compose plugin)

No local Node.js or pnpm required — theme compilation runs inside Docker.

## Quick Start

```bash
cp .env.example .env
docker compose up
# first time setup - http://localhost:2368/ghost
# then select your local theme in the admin section
# http://localhost:2368/ghost/#/settings/design/change-theme
```

That's it. Three services start automatically:
- **db** — MySQL 8.0
- **ghost** — Ghost 6 at http://localhost:2368
- **dev** — Node 22 running `pnpm dev` (Vite watch on all themes)

## First-Run Steps (required once)

1. Wait ~30 seconds for MySQL to initialize
   - Check: `docker compose logs -f db` — wait for "ready for connections"
2. Wait for the dev service to finish installing dependencies
   - Check: `docker compose logs -f dev` — wait for "watching for file changes"
3. Visit http://localhost:2368/ghost
4. Complete the Ghost setup wizard (create your admin account)
5. Settings > Design > Change theme > Activate **theme-one**
6. Visit http://localhost:2368 — your theme is live

## Development Commands

| Command | What it does |
|---|---|
| `docker compose up -d` | Start everything (db, ghost, dev watcher) |
| `docker compose logs -f dev` | Watch Vite build output |
| `docker compose logs -f ghost` | Tail Ghost logs |
| `docker compose down` | Stop (data persists in local volumes) |
| `docker compose down -v` | Stop AND delete all volume data |

## Themes

| Theme | Description |
|---|---|
| **Source** | Ghost's default theme, migrated from Gulp to Vite |
| **theme-one** | Starter theme with blue/teal palette |
| **theme-two** | Starter theme with warm orange/coral palette |

## Bringing Your Own Theme

Drop your existing Ghost theme into `themes/`, remove any starter themes you don't need, and make sure your theme's `package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "<your-tool> --watch",
    "build": "<your-tool>",
    "lint": "npx gscan ."
  }
}
```

The build tool is up to you — Vite, Gulp, Rollup, esbuild, or anything else. The workspace only requires that `dev` runs a watch/rebuild loop and `build` produces a one-shot production build. Output must land wherever your `default.hbs` references assets (typically `assets/built/`).

Then add a bind mount in `docker-compose.yml` for the ghost service and restart. See [docs/THEME-DEVELOPMENT.md](docs/THEME-DEVELOPMENT.md) for full steps.

## Building for Production

```bash
pnpm --filter my-theme build
# Upload assets/built/ contents or package as a zip for Ghost Admin
```

## Environment

The `.env` file contains dev-only database credentials and is gitignored. Copy from `.env.example` to get started. **Never use these credentials in production.**

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed explanations of every technology decision.

## Troubleshooting

- **Ghost fails to start / can't connect to db:** MySQL is still initializing. Check `docker compose logs db`. The healthcheck retries 10x over ~90 seconds.
- **Theme not appearing in Ghost Admin:** Verify the bind mount path in docker-compose.yml matches the directory name under `themes/`. Restart ghost: `docker compose restart ghost`
- **CSS/JS changes not reflected:** Check `docker compose logs -f dev` to confirm Vite is watching and rebuilding. Check that `assets/built/` is populated.
- **gscan errors:** Check [docs/THEME-DEVELOPMENT.md](docs/THEME-DEVELOPMENT.md) for required .hbs files. The most common error is a missing `error.hbs` or invalid `{{content}}` usage.
