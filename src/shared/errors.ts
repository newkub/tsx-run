export class TsxRunError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'TsxRunError'
	}
}
