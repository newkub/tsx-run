import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isBareSpecifier, isLocalPackage, toEsmShUrl } from '../resolve/esm'
import type { Plugin } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
/** D:/opensource/tsx-run (works for src/ and bundled dist/ layouts). */
export const PACKAGE_ROOT: string = resolve(__dirname, '..')

export const ENTRY_MODULE_ID = 'virtual:tsx-run-entry'
export const ENTRY_MODULE_RESOLVED: string = '\0' + ENTRY_MODULE_ID

/** Real file inside this package — used as resolution probe importer. */
const PROBE_IMPORTER = resolve(PACKAGE_ROOT, 'src', 'index.ts')

export interface TsxRunPluginOptions {
	entry: string
	/** Public URL path the entry file is served from (/@fs/…). */
	entryUrl: string
	/** Optional version pins: { 'zod': '3.25.76' } */
	pins?: Record<string, string> | undefined
}

/**
 * Virtual SPA entry: mounts the user's default-exported component.
 * Uses render(() => App()) so the module itself needs no JSX transform.
 */
export function tsxRunPlugin(options: TsxRunPluginOptions): Plugin {
	return {
		name: 'tsx-run:entry',
		resolveId(id) {
			if (id === ENTRY_MODULE_ID) return ENTRY_MODULE_RESOLVED
			return null
		},
		load(id) {
			if (id !== ENTRY_MODULE_RESOLVED) return null
			return [
				`import 'uno.css'`,
				`import { render } from 'solid-js/web'`,
				`import App from ${JSON.stringify(options.entryUrl)}`,
				`const root = document.getElementById('root')`,
				`if (!root) throw new Error('tsx-run: #root element missing')`,
				`render(() => App(), root)`,
			].join('\n')
		},
	}
}

/**
 * Resolves solid-js and subpaths (solid-js/web, /store, /h, /html, …)
 * against tsx-run's own node_modules by re-resolving from a probe
 * importer inside this package. Keeps exactly one Solid runtime and
 * works no matter where the user's entry file lives.
 */
export function solidLocalPlugin(): Plugin {
	return {
		name: 'tsx-run:solid-local',
		enforce: 'pre',
		async resolveId(id, _importer, options) {
			if (!isLocalPackage(id)) return null
			const resolved = await this.resolve(id, PROBE_IMPORTER, {
				...options,
				skipSelf: true,
			})
			return resolved ?? null
		},
	}
}

/** Serves the SPA index.html at / — no user HTML file required. */
export function indexHtmlPlugin(): Plugin {
	const html = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>tsx-run</title>
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="/@id/__x00__${ENTRY_MODULE_ID}"></script>
	</body>
</html>`
	return {
		name: 'tsx-run:index-html',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const url = req.url?.split('?')[0]
				if (url === '/' || url === '/index.html') {
					res.setHeader('Content-Type', 'text/html; charset=utf-8')
					res.end(html)
					return
				}
				next()
			})
		},
	}
}

/**
 * Rewrites bare third-party imports to esm.sh URLs.
 * solid-js and friends are excluded — they must come from tsx-run's
 * own node_modules so the app gets exactly one Solid runtime.
 */
export function esmShPlugin(pins: Record<string, string> | undefined = {}): Plugin {
	return {
		name: 'tsx-run:esm-sh',
		enforce: 'pre',
		resolveId(id) {
			if (isLocalPackage(id)) return null
			// unocss virtual entries and css specifiers are handled by other plugins
			if (id.endsWith('.css') || id.startsWith('@unocss') || id.startsWith('uno.')) return null
			const [specifier, ...rest] = id.split('?')
			const query = rest.length ? `?${rest.join('?')}` : ''
			if (!isBareSpecifier(specifier!)) return null
			const packageName = specifier!.split('/').slice(0, specifier!.startsWith('@') ? 2 : 1).join('/')
			return toEsmShUrl(specifier!, pins[packageName]) + query
		},
	}
}
