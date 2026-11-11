import { dirname } from 'node:path'
import { createServer, type PluginOption, type ViteDevServer } from 'vite'
import UnoCSS from 'unocss/vite'
import solid from 'vite-plugin-solid'
import { createUnoConfig } from '../css/unocss'
import { esmShPlugin, indexHtmlPlugin, PACKAGE_ROOT, solidLocalPlugin, tsxRunPlugin } from './plugins'

export interface DevServerOptions {
	entry: string
	port: number
	host: string
	pins?: Record<string, string> | undefined
}

export interface StartedServer {
	server: ViteDevServer
	url: string
}

export async function createDevServer(options: DevServerOptions): Promise<StartedServer> {
	const entryUrl = `/@fs/${options.entry.replaceAll('\\', '/')}`
	const entryDir = dirname(options.entry)

	const plugins: PluginOption[] = [
		indexHtmlPlugin(),
		tsxRunPlugin({ entry: options.entry, entryUrl, pins: options.pins }),
		solidLocalPlugin(),
		solid(),
		UnoCSS(createUnoConfig()) as PluginOption,
		esmShPlugin(options.pins),
	]

	const server = await createServer({
		configFile: false,
		root: entryDir,
		logLevel: 'warn',
		plugins,
		resolve: {
			dedupe: ['solid-js'],
		},
		server: {
			port: options.port,
			host: options.host,
			open: false,
			fs: {
				strict: true,
				allow: [entryDir, PACKAGE_ROOT],
				deny: ['.env', '.env.*', '*.{crt,key}', '**/.git/**'],
			},
		},
	})

	await server.listen()
	const url = server.resolvedUrls?.local[0] ?? `http://${options.host}:${options.port}/`
	return { server, url }
}
