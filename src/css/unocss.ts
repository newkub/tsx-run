import presetIcons from '@unocss/preset-icons'
import presetWind4 from '@unocss/preset-wind4'
import type { UserConfig } from 'unocss'

export function createUnoConfig(): UserConfig {
	return {
		presets: [
			presetWind4(),
			presetIcons({
				warn: true,
			}),
		],
	}
}
