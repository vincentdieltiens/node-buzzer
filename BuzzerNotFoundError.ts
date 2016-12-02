export class BuzzerNotFoundError extends Error {
	public name = "BuzzerNotFoundError"

	constructor(public message: string) {
		super(message)
	}
}