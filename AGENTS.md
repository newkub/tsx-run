# tsx-run

Instant SolidJS SPA runner for TSX files — `tsx-run run App.tsx` serves a Vite dev server with Solid JSX transform, UnoCSS (presetWind4 + presetIcons), HMR, and esm.sh resolution for bare imports.

## Commands

- Install: `bun install`
- Typecheck/lint: `bun run lint` (`bun check`)
- Test: `bun test`
- Build: `bun run build` (bunup → `dist/`)
- Dev CLI: `bun run dev -- run <file.tsx> [--port N] [--host H] [--no-open]`

## Conventions

- Runtime is Bun; CLI args via `cac`, colors via `picocolors`.
- Vite config is generated in memory (`src/server/create-server.ts`) — never write a user-facing config file.
- `solid-js*` must stay local (see `src/resolve/esm.ts`); everything else bare goes to esm.sh.
- Keep the MVP scope: SPA only, no SSR/backend/router/package-manager.
