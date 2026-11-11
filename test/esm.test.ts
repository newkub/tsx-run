import { describe, expect, test } from 'bun:test'
import { isBareSpecifier, isLocalPackage, toEsmShUrl } from '../src/resolve/esm'

describe('isBareSpecifier', () => {
	test('accepts package names and subpaths', () => {
		expect(isBareSpecifier('zod')).toBe(true)
		expect(isBareSpecifier('date-fns/format')).toBe(true)
		expect(isBareSpecifier('@scope/pkg/sub')).toBe(true)
	})

	test('rejects relative, absolute, url and virtual ids', () => {
		expect(isBareSpecifier('./App')).toBe(false)
		expect(isBareSpecifier('/abs/path')).toBe(false)
		expect(isBareSpecifier('https://esm.sh/zod')).toBe(false)
		expect(isBareSpecifier('virtual:uno.css')).toBe(false)
		expect(isBareSpecifier('@vite/client')).toBe(true) // bare — resolved locally by vite
	})
})

describe('isLocalPackage', () => {
	test('solid-js family stays local', () => {
		expect(isLocalPackage('solid-js')).toBe(true)
		expect(isLocalPackage('solid-js/web')).toBe(true)
		expect(isLocalPackage('solid-js/store')).toBe(true)
		expect(isLocalPackage('solid-primitives')).toBe(false)
	})
})

describe('toEsmShUrl', () => {
	test('builds esm.sh urls', () => {
		expect(toEsmShUrl('zod')).toBe('https://esm.sh/zod')
		expect(toEsmShUrl('date-fns/format')).toBe('https://esm.sh/date-fns/format')
		expect(toEsmShUrl('@scope/pkg/sub')).toBe('https://esm.sh/@scope/pkg/sub')
	})

	test('applies version pins to the package name only', () => {
		expect(toEsmShUrl('zod', '3.25.76')).toBe('https://esm.sh/zod@3.25.76')
		expect(toEsmShUrl('date-fns/format', '4.1.0')).toBe('https://esm.sh/date-fns@4.1.0/format')
	})
})
