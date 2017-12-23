'use strict';

import { Ps2Buzzer } from '../ps2';
import { BuzzerNotFoundError } from '../BuzzerNotFoundError';

let buzzer = new Ps2Buzzer();

buzzer.addEventListener('ready', () => {
	console.log('Buzzer ready ! Push any button');
	let max = buzzer.controllersCount();

	// Turn off all lights
	for(var i=0; i < max; i++) {
		buzzer.lightOff(i)
	}
});

buzzer.addEventListener('error', (e) => {
	console.log('error...', e)
})

buzzer.addEventListener('leave', (e) => {
	console.log('disconnected...', e)
})


// Buzzer pressing callback
// controllerIndex : 0 to 3 to tell with controller buzzed
// buttonIndex : 0 to 4 to tell with button has been pressed (0: big dome button, 1: blue, 2: orange: 3: green, 4: yellow)
buzzer.onPress((controllerIndex, buttonIndex) => {
	console.log('buzz !', controllerIndex, buttonIndex);
	buzzer.blink(controllerIndex, 2, 100)
});

buzzer.connect(8000);