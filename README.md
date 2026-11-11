# tsx-run

Instant SolidJS SPA runner for TSX files. One file. One command. Instant preview.

```powershell
tsx-run run App.tsx
```

No `package.json`, no config file, no HTML file, no `render()` call — just write a TSX component with a default export and open the printed URL.

## Features

- SolidJS runtime + JSX transform (via Vite + `vite-plugin-solid`)
- HMR out of the box
- UnoCSS `presetWind4` utilities + `presetIcons` (Iconify) — zero config
- Bare imports resolved through [esm.sh](https://esm.sh) (`zod`, `date-fns`, `clsx`, …)
- SPA only — no SSR, no backend, no router

## Usage

```powershell
tsx-run run App.tsx
tsx-run run App.tsx --port 3000
tsx-run run App.tsx --open
tsx-run run App.tsx --host 0.0.0.0
tsx-run run App.tsx --no-open
tsx-run --help
tsx-run --version
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--port <port>` | Port to listen on | `3000` |
| `--host <host>` | Host to bind to | `localhost` |
| `--open` / `--no-open` | Open the preview in a browser | open |
| `--pin <pkg@version...>` | Pin an external package version | — |

## Authoring

```tsx
import { createSignal } from 'solid-js'
import { format } from 'date-fns'

export default function App() {
  const [count, setCount] = createSignal(0)

  return (
    <main class="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <section class="space-y-4 text-center">
        <h1 class="text-3xl font-bold">Hello TSX Run</h1>
        <i class="i-mdi-home text-2xl" />
        <p>{format(new Date(), 'PP')}</p>
        <button
          class="rounded-lg bg-blue-600 px-5 py-2 hover:bg-blue-500"
          onClick={() => setCount(count() + 1)}
        >
          Count: {count()}
        </button>
      </section>
    </main>
  )
}
```

See [`examples/App.tsx`](examples/App.tsx).

## Requirements

- [Bun](https://bun.sh) `>= 1.2`

```powershell
bun install -g tsx-run   # or: bunx tsx-run run App.tsx
```

## How it works

```
tsx-run run App.tsx
      │
      ▼
entry validation ──► virtual SPA entry (auto render())
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
  vite-plugin-solid   UnoCSS (wind4+icons)  esm.sh resolver
        │                 │                  │
        └─────────────────┴──────────────────┘
                          ▼
              Vite dev server + HMR ──► browser preview
```

- `solid-js*` imports always resolve to tsx-run's own copy — a single Solid runtime, no duplicates.
- Other bare imports are rewritten to `https://esm.sh/<pkg>`; pin a version with `--pin zod@3.25.76`.
- Packages that need Node.js APIs or native modules will fail in the browser — tsx-run is browser-ESM only.

## Development

```powershell
bun install
bun run dev -- run examples/App.tsx --no-open   # run the CLI from source
bun run build                                  # bundle to dist/
bun run lint                                   # typecheck
bun test                                       # unit tests
```

## License

MIT
