import { defineConfig } from 'bunup'

export default defineConfig({
	dts: { splitting: true },
	entry: ['src/cli.ts', 'src/index.ts'],
})
