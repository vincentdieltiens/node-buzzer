'use strict';

import { TeensyBuzzer } from '../teensy';

let buzzer = new TeensyBuzzer(4);

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

buzzer.onPress((controllerIndex, buttonIndex) => {
	console.log('buzz !', controllerIndex, buttonIndex);
	buzzer.blink(controllerIndex, 2, 100)
});

buzzer.connect(8000);