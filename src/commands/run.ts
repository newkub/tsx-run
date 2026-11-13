import { spawn } from 'node:child_process'
import { relative, sep } from 'node:path'
import pc from 'picocolors'
import { resolveEntry } from './entry'
import { createDevServer } from '../server/create-server'

export interface RunOptions {
	port: number
	host: string
	open: boolean
	pins?: Record<string, string> | undefined
}

export async function run(file: string, options: RunOptions): Promise<void> {
	const entry = resolveEntry(file)
	const { server, url } = await createDevServer({
		entry,
		port: options.port,
		host: options.host,
		pins: options.pins,
	})

	printHeader(relative(process.cwd(), entry).split(sep).join('/'), url)

	if (options.open) openBrowser(url)

	const shutdown = async () => {
		await server.close()
		process.exit(0)
	}
	process.on('SIGINT', shutdown)
	process.on('SIGTERM', shutdown)
}

function printHeader(entry: string, url: string): void {
	console.log(
		[
			'',
			`  ${pc.bold('TSX Run')}`,
			'',
			`  ${pc.dim('Runtime')}    SolidJS`,
			`  ${pc.dim('Mode')}       SPA`,
			`  ${pc.dim('CSS')}        UnoCSS (presetWind4)`,
			`  ${pc.dim('Icons')}      Iconify`,
			`  ${pc.dim('Entry')}      ${entry}`,
			'',
			`  ${pc.green('Local')}      ${pc.cyan(url)}`,
			'',
		].join('\n'),
	)
}

function openBrowser(url: string): void {
	const [cmd, args] =
		process.platform === 'win32'
			? (['cmd', ['/c', 'start', '', url]] as const)
			: process.platform === 'darwin'
				? (['open', [url]] as const)
				: (['xdg-open', [url]] as const)
	spawn(cmd, args, { stdio: 'ignore', detached: true }).unref()
}

