'use strict';

import { TeensyBuzzer } from '../teensy';

let buzzer = new TeensyBuzzer(4);

let currentOn = null;

buzzer.addEventListener('ready', () => {
	console.log('Buzzer ready ! Push any button');
	

	let max = buzzer.controllersCount();

	// Turn off all lights
	for(var i=0; i < max; i++) {
		buzzer.lightOff(i)
	}

	//buzzer.lightOn(0);
});

buzzer.addEventListener('error', (e) => {
	console.log('error...', e)
})

buzzer.addEventListener('leave', (e) => {
	console.log('disconnected...', e)
})

buzzer.onPress((controllerIndex, buttonIndex) => {
	console.log('buzz !', controllerIndex, buttonIndex);
	if (currentOn !== null) {
		console.log('off!')
		buzzer.lightOff(currentOn);
	}
	//buzzer.blink(controllerIndex, 2, 100)
	buzzer.lightOn(controllerIndex);
	currentOn = controllerIndex;
});

buzzer.connect(8000);