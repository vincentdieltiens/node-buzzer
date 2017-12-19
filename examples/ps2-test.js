'use strict';

import { Ps2Buzzer } from '../ps2';
import { BuzzerNotFoundError } from '../BuzzerNotFoundError';

try {
	let buzzer = new Ps2Buzzer();

	buzzer.addEventListener('ready', () => {
		console.log('Buzzer ready ! Push any button');
		let max = buzzer.controllersCount();

		// Turn off all lights
		for(var i=0; i < max; i++) {
			buzzer.lightOff(i)
		}
	});

	// Buzzer pressing callback
    // controllerIndex : 0 to 3 to tell with controller buzzed
    // buttonIndex : 0 to 4 to tell with button has been pressed (0: big dome button, 1: blue, 2: orange: 3: green, 4: yellow)
	buzzer.onPress((controllerIndex, buttonIndex) => {
		console.log('buzz !', controllerIndex, buttonIndex);
		buzzer.blink(controllerIndex, 2, 100)
	});
} catch(e) {
	if (e instanceof BuzzerNotFoundError) {
		console.log(e)
	}
}


