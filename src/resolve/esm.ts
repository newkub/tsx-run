const BARE_SPECIFIER = /^[\w@][\w\-./@]*$/
const SKIP_PREFIXES = ['.', '/', 'virtual:', 'data:', 'http:', 'https:']

/** Packages that must resolve to tsx-run's own node_modules — never the CDN. */
const LOCAL_PACKAGES = ['solid-js', 'solid-js/', '@solidjs/']

export function isBareSpecifier(id: string): boolean {
	if (!BARE_SPECIFIER.test(id)) return false
	return !SKIP_PREFIXES.some((p) => id.startsWith(p))
}

export function isLocalPackage(id: string): boolean {
	return LOCAL_PACKAGES.some((p) => id === p || id.startsWith(p))
}

function splitPackage(id: string): { name: string; subpath: string } {
	const parts = id.split('/')
	const name = id.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]!
	const subpath = id.slice(name.length)
	return { name, subpath }
}

export function toEsmShUrl(id: string, pin?: string): string {
	const { name, subpath } = splitPackage(id)
	const version = pin ? `@${pin}` : ''
	return `https://esm.sh/${name}${version}${subpath}`
}
