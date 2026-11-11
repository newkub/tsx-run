#!/usr/bin/env bun
import { cac } from 'cac'
import pc from 'picocolors'
import pkg from '../package.json' with { type: 'json' }
import { run } from './commands/run'
import { TsxRunError } from './shared/errors'

const cli = cac('tsx-run')

cli
	.command('run <file>', 'Run a SolidJS TSX file as an instant SPA')
	.option('--port <port>', 'Port to listen on', { default: 3000 })
	.option('--host <host>', 'Host to bind to', { default: 'localhost' })
	.option('--open', 'Open the preview in a browser', { default: true })
	.option('--no-open', 'Do not open the preview in a browser')
	.option('--pin <pkg@version...>', 'Pin an external package version, e.g. --pin zod@3.25.76')
	.action(async (file: string, options: Record<string, unknown>) => {
		try {
			const pins: Record<string, string> = {}
			const pinOption = options.pin as string | string[] | undefined
			const pinList = pinOption === undefined ? [] : Array.isArray(pinOption) ? pinOption : [pinOption]
			for (const pin of pinList) {
				const at = pin.lastIndexOf('@')
				if (at <= 0) throw new TsxRunError(`Invalid --pin "${pin}", expected pkg@version`)
				pins[pin.slice(0, at)] = pin.slice(at + 1)
			}
			await run(file, {
				port: Number(options.port),
				host: String(options.host),
				open: options.open !== false,
				pins,
			})
		} catch (error) {
			if (error instanceof TsxRunError) {
				console.error(pc.red(`error: ${error.message}`))
				process.exit(1)
			}
			throw error
		}
	})

cli.help()
cli.version(pkg.version)

cli.parse()
