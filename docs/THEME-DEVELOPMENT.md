# Theme Development Guide

## Initial setup (once)

1. Copy the environment file and start all services:
   ```bash
   cp .env.example .env
   docker compose up -d
   ```
   This starts three services: **db** (MySQL), **ghost** (Ghost 6), and **dev** (Node 22 running Vite watch).

2. Wait ~30 seconds for MySQL to initialize:
   ```bash
   docker compose logs -f db
   ```
   Wait until you see "ready for connections".

3. Wait for the dev service to install dependencies and start watching:
   ```bash
   docker compose logs -f dev
   ```
   Wait until you see "watching for file changes".

4. Visit http://localhost:2368/ghost and complete the Ghost setup wizard (create your admin account).

5. Go to Settings > Design > Change theme > Activate **theme-one** (or whichever theme you want to work on).

## Daily dev loop

1. Start Docker services (if not already running):
   ```bash
   docker compose up -d
   ```
   The dev service automatically runs `pnpm dev` (Vite watch on all themes).

2. **Edit `.hbs` files** — Ghost's native livereload detects changes and auto-refreshes the browser.

3. **Edit `.css` / `.js` files** — Vite (in the dev container) rebuilds `assets/built/`, then Ghost livereload picks up the new files and refreshes the browser.

4. **Monitor builds**: `docker compose logs -f dev`

## Adding a new theme

1. Copy an existing theme:
   ```bash
   cp -r themes/theme-one themes/your-theme-name
   ```

2. Update `name` in `themes/your-theme-name/package.json`:
   ```json
   "name": "your-theme-name"
   ```

3. Add volumes in `docker-compose.yml` under the ghost service:
   ```yaml
   # Theme bind mount
   - ./themes/your-theme-name:/var/lib/ghost/content/themes/your-theme-name
   # Hide node_modules from Ghost's chown
   - /var/lib/ghost/content/themes/your-theme-name/node_modules
   ```

4. Restart all services to pick up the new bind mount and workspace package:
   ```bash
   docker compose down && docker compose up -d
   ```

5. Activate the theme in Ghost Admin: Settings > Design > Change theme.

## Using gscan

gscan is Ghost's official theme validator. It checks your theme against the Ghost theme specification.

```bash
# Validate a specific theme
pnpm --filter theme-one lint

# Validate all themes
pnpm lint

# Run directly with verbose output
cd themes/theme-one && npx gscan . --verbose
```

### What gscan checks

- Required template files exist (default.hbs, index.hbs, post.hbs, etc.)
- Handlebars helpers are used correctly
- Package.json has required fields (`name`, `version`, `engines.ghost`)
- Assets are referenced properly

### Exit codes

- **0**: No errors (warnings may still be present)
- **Non-zero**: Errors found — theme will be rejected by Ghost

### Common issues

| Issue | Fix |
|---|---|
| Missing `error.hbs` | Create an error template with `{{statusCode}}` and `{{message}}` |
| Missing `{{ghost_head}}` | Add `{{ghost_head}}` before `</head>` in default.hbs |
| Missing `{{ghost_foot}}` | Add `{{ghost_foot}}` before `</body>` in default.hbs |
| Invalid `{{content}}` usage | Use `{{content}}` inside a `{{#post}}` block |

## Building for production

```bash
# Build a specific theme
pnpm --filter theme-one build

# Build all themes
pnpm build
```

The build output lands in each theme's `assets/built/` directory. These files are what Ghost serves to visitors.
