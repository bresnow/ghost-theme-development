# Theme Development Guide

## Initial setup (once)

1. Copy the environment file and start services:
   ```bash
   cp .env.example .env
   docker compose up -d
   ```

2. Wait ~30 seconds for MySQL to initialize:
   ```bash
   docker compose logs -f db
   ```
   Wait until you see "ready for connections".

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Visit http://localhost:2380/ghost and complete the Ghost setup wizard (create your admin account).

5. Go to Settings > Design > Change theme > Activate **theme-one** (or whichever theme you want to work on).

## Daily dev loop

1. Start Docker services (if not already running):
   ```bash
   docker compose up -d
   ```

2. Start Vite in watch mode for your theme:
   ```bash
   pnpm dev:theme-one
   ```
   This runs `vite build --watch`, which rebuilds `assets/built/` on every source change.

3. **Edit `.hbs` files** — Ghost's native livereload detects changes and auto-refreshes the browser.

4. **Edit `.css` / `.js` files** — Vite rebuilds the bundle in `assets/built/`, then Ghost livereload picks up the new files and refreshes the browser.

5. **Validate your theme**:
   ```bash
   pnpm lint:theme-one
   ```

## Adding a new theme

1. Copy an existing theme:
   ```bash
   cp -r themes/theme-one themes/your-theme-name
   ```

2. Update `name` in `themes/your-theme-name/package.json`:
   ```json
   "name": "your-theme-name"
   ```

3. Add a bind mount in `docker-compose.yml` under the ghost service volumes:
   ```yaml
   - ./themes/your-theme-name:/var/lib/ghost/content/themes/your-theme-name
   ```

4. Add dev/build/lint scripts in the root `package.json`:
   ```json
   "dev:your-theme-name": "pnpm --filter your-theme-name dev",
   "build:your-theme-name": "pnpm --filter your-theme-name build",
   "lint:your-theme-name": "pnpm --filter your-theme-name lint"
   ```

5. Register the new workspace package:
   ```bash
   pnpm install
   ```

6. Restart Ghost to pick up the new bind mount:
   ```bash
   docker compose restart ghost
   ```

7. Activate the theme in Ghost Admin: Settings > Design > Change theme.

## Using gscan

gscan is Ghost's official theme validator. It checks your theme against the Ghost theme specification.

```bash
# Validate a specific theme
pnpm lint:theme-one

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
pnpm build:theme-one

# Build all themes
pnpm build
```

The build output lands in each theme's `assets/built/` directory. These files are what Ghost serves to visitors.
