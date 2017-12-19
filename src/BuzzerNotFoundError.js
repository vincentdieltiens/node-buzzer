'use strict';

import ExtendableError from 'es6-error';

export class BuzzerNotFoundError extends ExtendableError {
	//public name = "BuzzerNotFoundError"

	constructor(message) {
		super(message);
	}
}