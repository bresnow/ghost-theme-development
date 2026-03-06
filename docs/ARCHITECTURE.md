# Architecture Decisions

## Why pnpm workspaces

pnpm workspaces were chosen over npm or yarn for several reasons:

- **Disk efficiency**: pnpm uses a content-addressable store and hard links, so shared dependencies (like Vite, PostCSS) are stored once on disk regardless of how many themes use them.
- **Strict dependency resolution**: Unlike npm, pnpm doesn't hoist packages to the root by default, preventing themes from accidentally importing undeclared dependencies.
- **Native workspace protocol**: `pnpm -r --parallel` and `pnpm --filter @themes/theme-name` provide ergonomic commands for running scripts across specific themes.
- **Speed**: pnpm installs are consistently faster than npm or yarn classic due to the linking strategy.

## Why Vite in build-only mode (no dev server)

Ghost is a server-rendered application using Handlebars templates. The browser loads fully rendered HTML from Ghost, not from a Vite dev server. This means:

- **Vite's dev server is incompatible** with Ghost's rendering model — there's no `index.html` for Vite to serve.
- **`vite build --watch`** is the correct mode: Vite watches source files, rebuilds CSS/JS to `assets/built/`, and Ghost's livereload picks up the changes.
- **Vite replaces Gulp/Rollup** as the build tool. It handles JS bundling (replacing gulp-concat + gulp-uglify), PostCSS processing (replacing gulp-postcss), and file watching — all in a single tool with faster rebuilds.
- Output filenames are **deterministic without content hashes** because Ghost templates reference assets via `{{asset "built/index.js"}}` — a fixed path. Ghost's `{{asset}}` helper appends its own cache-busting query parameter.

## How Ghost's native livereload works

When Ghost runs with `NODE_ENV=development`:

1. Ghost injects a livereload script into every page via `{{ghost_foot}}`.
2. Ghost watches the active theme's directory for file changes.
3. When `.hbs` files change, the browser automatically refreshes.
4. When `assets/built/` files change (from a Vite rebuild), livereload also triggers a refresh.

This means **no additional livereload tooling is needed** — no browser extensions, no gulp-livereload, no BrowserSync. Ghost handles it natively.

## Why MySQL 8.0

The official Ghost Docker image requires a MySQL-compatible database:

- Ghost 6 officially supports MySQL 8.0.
- SQLite is only suitable for single-user/testing scenarios.
- MySQL 8.0 is the widely deployed LTS release with broad tooling support.

This is not a preference — it's a requirement of the Ghost Docker image for reliable operation.

## Docker volume strategy

### The problem with mounting `/var/lib/ghost/content`

If you mount a single named volume at `/var/lib/ghost/content`, Docker creates a volume layer that **shadows everything** underneath it, including the `themes/` subdirectory. Any bind mounts for individual themes at `/var/lib/ghost/content/themes/theme-name` would be invisible because the parent named volume takes precedence.

### The subdirectory-only approach

Instead, we mount named volumes only on the specific subdirectories that need persistence:

```
ghost_content_data:/var/lib/ghost/content/data      # SQLite/MySQL data files
ghost_content_images:/var/lib/ghost/content/images   # Uploaded images
ghost_content_logs:/var/lib/ghost/content/logs       # Ghost log files
```

The `themes/` directory inside the container is left unmanaged by Docker volumes, so individual theme bind mounts work correctly:

```
./themes/Source:/var/lib/ghost/content/themes/Source
./themes/theme-one:/var/lib/ghost/content/themes/theme-one
./themes/theme-two:/var/lib/ghost/content/themes/theme-two
```

This ensures that local file edits are immediately visible inside the container.

## Why gscan for theme validation

[gscan](https://github.com/TryGhost/gscan) is Ghost's official theme validation tool:

- It checks for required files (default.hbs, index.hbs, post.hbs, etc.)
- It validates Handlebars helper usage against the Ghost API
- It reports errors (blocking) and warnings (non-blocking)
- It exits with a non-zero code on errors, making it CI-safe
- It runs locally via `npx gscan .` — no Ghost instance needed

### Interpreting gscan output

- **Errors** (red): Must be fixed — Ghost will reject themes with errors.
- **Warnings** (yellow): Recommendations — the theme will still work but may have issues.
- **Recommendations** (blue): Best practices — optional improvements.

## How to add a new theme

1. Copy an existing theme directory: `cp -r themes/theme-one themes/my-theme`
2. Update `name` in `themes/my-theme/package.json` to `my-theme`
3. Add a bind mount in `docker-compose.yml`:
   ```yaml
   - ./themes/my-theme:/var/lib/ghost/content/themes/my-theme
   ```
4. Add scripts to root `package.json`:
   ```json
   "dev:my-theme": "pnpm --filter my-theme dev",
   "build:my-theme": "pnpm --filter my-theme build",
   "lint:my-theme": "pnpm --filter my-theme lint"
   ```
5. Run `pnpm install` to register the new workspace package.
6. Restart Ghost: `docker compose restart ghost`
7. Activate the theme in Ghost Admin: Settings > Design > Change theme.
