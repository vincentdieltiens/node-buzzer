'use strict';

import * as HID from 'node-hid';
import { Buzzer } from '../Buzzer';
import { BuzzerNotFoundError } from '../BuzzerNotFoundError';
import { BuzzerReadError } from '../BuzzerReadError';

var signals = [
	// controller 1
	[0, 0, 1, 0, 240],
	[0, 0, 16, 0, 240],
	[0, 0, 8, 0, 240],
	[0, 0, 4, 0, 240],
	[0, 0, 2, 0, 240],
	// controller 2
	[0, 0, 32, 0, 240],
	[0, 0, 0, 2, 240],
	[0, 0, 0, 1, 240],
	[0, 0, 128, 0, 240],
	[0, 0, 64, 0, 240],
	// controller 3
	[0, 0, 0, 4, 240],
	[0, 0, 0, 64, 240],
	[0, 0, 0, 32, 240],
	[0, 0, 0, 16, 240],
	[0, 0, 0, 8, 240],
	// controller 4
	[0, 0, 0, 128, 240],
	[0, 0, 0, 0, 248],
	[0, 0, 0, 0, 244],
	[0, 0, 0, 0, 242],
	[0, 0, 0, 0, 241]
]

function signalsEqual(a, b) {
	for(var i=0; i < 5; i++) {
		if (a[i] != b[i]) {
			return false;
		}
	}
	return true;
}

function searchSignalIndex(signal)/*: number*/ {
	for (var i=0; i < signals.length; i++) {
		if (signalsEqual(signal, signals[i])) {
			return i;
		}
	}
	return -1;
}

export class Ps2Buzzer extends Buzzer {
	constructor(device=null) {
		super();
		this.eventListeners = { 'ready': [], 'leave': [], 'error': [] };
		this.lights = [0x0, 0x0, 0x0, 0x0];
		this.handlers = [];
	}

	connect(timeout=0) {
		this.timeout = timeout;
		this.waitForDevice();
	}

	waitForDevice() {
		let interval;
		let startTime = Date.now();
		let tick = () => {
			let currentTime = Date.now();
			if (this.timeout > 0 && currentTime - startTime > this.timeout) {
				clearInterval(interval);
				this.triggerEvent('error', new BuzzerNotFoundError('PS2 buzzer not found'));
			}

			if (!this.device) {
				try {
					this.device = new HID.HID(0x054c, 0x1000);
					clearInterval(interval);
				} catch(e) {
					return; // Do not init at this tick
				}
			} else {
				clearInterval(interval);
			}

			this.init();
		};
		interval = setInterval(tick, 1000);
		tick();
	}

	init(device) {
		this.triggerEvent('ready');
		this.device.on("data", (signal) => {
			var signalIndex = searchSignalIndex(signal);
			if (signalIndex >= 0) {
				var controllerIndex = Math.floor(signalIndex / 5);
				var buttonIndex = signalIndex % 5;

				var key = 'c'+controllerIndex+'b'+buttonIndex;
				this.callHandlers(key, controllerIndex, buttonIndex);

				key = 'c'+controllerIndex;
				this.callHandlers(key, controllerIndex, buttonIndex);
				this.callHandlers('all', controllerIndex, buttonIndex);
			}
		});

		this.device.on("error", (e) => {
			let error = new BuzzerReadError(e);
			this.triggerEvent('error', error);
			this.triggerEvent('leave', error);
		});
	}

	leave() {
		this.light([0, 1, 2, 3], 0x00);
		this.device.close();
	}

	light(controllerIndexes, value) {
		if (value != 0x00 && value != 0xFF) {
			throw new Error("light should have a value of 0x0 or 0xFF")
		}
		var message = [0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0];

		if (typeof(controllerIndexes) == 'number') {
			this.lights[controllerIndexes] = value;
		} else {
			for(var ctrl in controllerIndexes) {
				this.lights[controllerIndexes[ctrl]] = value;
			}
		}

		for (var i in this.lights) {
			var j = parseInt(i, 10)+2;
			message[j] = this.lights[i];
		}

		this.device.write(message);
	}

	lightOn(controllerIndexes) {
		this.light(controllerIndexes, 0xFF);
	}

	lightOff(controllerIndexes) {
		this.light(controllerIndexes, 0x0);
	}

	blink(controllerIndexes, times = 5, duration = 150) {
		var on = true
		var count = 0;
		var interval = setInterval(() => {
			if (on) {
				if (count > times) {
					clearInterval(interval);
					return;
				}
				this.lightOn(controllerIndexes);
				count++;
			} else {
				this.lightOff(controllerIndexes);
			}

			on = !on;

		}, duration);
	}

	controllersCount()/*:number*/ {
		return 4;
	}
}
