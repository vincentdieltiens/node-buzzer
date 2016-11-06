/// <reference path="./typings/node-hid.d.ts" />

'use strict';

import * as HID from 'node-hid';
import { Buzzer } from '../buzzer';

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

function searchSignalIndex(signal): number {
	for (var i=0; i < signals.length; i++) {
		if (signalsEqual(signal, signals[i])) {
			return i;
		}
	}
	return -1;
}

function callHandlers(handlers:Array<Function>, controllerIndex:number, buttonIndex:number) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}

export class Ps2Buzzer implements Buzzer {
	device: HID.HID;
	lights: Array<any>;
	handlers: Array<Array<Function>>;
	eventListeners: { 'ready': Array<Function>, 'leave': Array<Function> };
	constructor(device) {
		this.device = device


		this.eventListeners = { 'ready': [], 'leave': [] };
		this.lights = [0x0, 0x0, 0x0, 0x0]

		this.handlers = [];
		this.device.on("data", (signal) => {
			var signalIndex = searchSignalIndex(signal);
			if (signalIndex >= 0) {
				var controllerIndex = Math.floor(signalIndex / 5);
				var buttonIndex = signalIndex % 5;

				var key = 'c'+controllerIndex+'b'+buttonIndex;
				callHandlers(this.handlers[key], controllerIndex, buttonIndex);

				key = 'c'+controllerIndex;
				callHandlers(this.handlers[key], controllerIndex, buttonIndex);

				callHandlers(this.handlers['all'], controllerIndex, buttonIndex);
			}
		});

		this.device.on("error", () => {
			this.eventListeners['leave'].forEach((f) => {
				f();
			});
		});
	}

	addEventListener(event: string, callback: Function) {
		this.eventListeners[event].push(callback);
		if (event == 'ready') {
			callback();
		}
	}

	removeEventListener(event: string, callback: Function) {
		var index = this.eventListeners[event].indexOf(callback);
		this.eventListeners[event].splice(index, 1);
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
		var interval = setInterval(function() {
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

	onPress(callback: Function, controllerIndex: number = undefined, buttonIndex: number = undefined): Function {
		var key = 'all';
		if (controllerIndex != undefined || buttonIndex != undefined) {
			key = '';
			if (controllerIndex != undefined) {
				key = 'c'+controllerIndex;
			}
			if (buttonIndex != undefined) {
				key += 'b'+buttonIndex
			}
		}

		if (!(key in this.handlers)) {
			this.handlers[key] = [];
		}
		this.handlers[key].push(callback);
		return () => {
			var index = this.handlers[key].indexOf(callback);
			if (index >= 0) {
				this.handlers[key].splice(index, 1);
			}
		};
	}

	controllersCount():number {
		return 4;
	}
}
