'use strict';

var _teensy = require('../teensy');

var buzzer = new _teensy.TeensyBuzzer(4);

buzzer.addEventListener('ready', function () {
	console.log('Buzzer ready ! Push any button');
	var max = buzzer.controllersCount();

	// Turn off all lights
	for (var i = 0; i < max; i++) {
		buzzer.lightOff(i);
	}
});

buzzer.addEventListener('error', function (e) {
	console.log('error...', e);
});

buzzer.addEventListener('leave', function (e) {
	console.log('disconnected...', e);
});

buzzer.onPress(function (controllerIndex, buttonIndex) {
	console.log('buzz !', controllerIndex, buttonIndex);
	buzzer.blink(controllerIndex, 2, 100);
});

buzzer.connect(8000);
//# sourceMappingURL=teensy-test.js.map
