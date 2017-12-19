'use strict';

var _teensy = require('../teensy');

var buzzer = new _teensy.TeensyBuzzer();

buzzer.addEventListener('ready', function () {
	console.log('Buzzer ready ! Push any button');
	var max = buzzer.controllersCount();

	// Turn off all lights
	for (var i = 0; i < max; i++) {
		buzzer.lightOff(i);
	}
});

buzzer.onPress(function (controllerIndex, buttonIndex) {
	console.log('buzz !', controllerIndex, buttonIndex);
	buzzer.blink(controllerIndex, 2, 100);
});
//# sourceMappingURL=teensy-test.js.map
