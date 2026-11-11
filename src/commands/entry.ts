import { existsSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { TsxRunError } from '../shared/errors'

const EXTENSIONS = new Set(['.tsx', '.jsx'])

export function resolveEntry(file: string, cwd: string = process.cwd()): string {
	const entry = resolve(cwd, file)
	if (!EXTENSIONS.has(extname(entry))) {
		throw new TsxRunError(`Entry must be a .tsx or .jsx file, got "${file}"`)
	}
	if (!existsSync(entry)) {
		throw new TsxRunError(`Entry file not found: ${entry}`)
	}
	return entry
}
