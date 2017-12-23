'use strict';

import * as HID from 'node-hid';
import { Buzzer } from '../Buzzer';
import { BuzzerNotFoundError } from '../BuzzerNotFoundError';
import { BuzzerReadError } from '../BuzzerReadError';

function getDevice(deviceInfo) {
	if (!deviceInfo) {
		return new HID.HID(5824, 1158);
	} else {
		return new HID.HID(deviceInfo.path);
	}
}

export class TeensyBuzzer extends Buzzer {
	constructor(buzzersCount = 4) {
		super();
		this.buzzersCount = buzzersCount;
	}

	connect(timeout=30000) {
		this.timeout = timeout;
		this.waitForDevice();
	}

	waitForDevice() {
		var devices = HID.devices()
		var deviceInfo = devices.find( function(d) {
			return d.vendorId===0x16C0 
					&& d.productId===0x0486 
					&& d.usagePage===0xFFAB 
					&& d.usage===0x200;
		});

		let interval;
		let startTime = Date.now();
		let tick = () => {
			let currentTime = Date.now();
			if (currentTime - startTime > this.timeout) {
				clearInterval(interval);
				this.triggerEvent('error', new BuzzerNotFoundError('Teensy buzzer not found'));
			}

			try {
				this.device = getDevice(deviceInfo);
				clearInterval(interval);
				this.init();
			} catch(e) {
				// do nothing
			}
		}
		interval = setInterval(tick, 1000);
		tick();
	}

	init() {
		this.triggerEvent('ready');
		this.device.on("data", (signal) => {
			var controllerIndex = signal[0];
			this.callHandlers('c'+controllerIndex, controllerIndex, 0);
			this.callHandlers('all', controllerIndex, 0);
		});

		this.device.on("error", (e) => {
			let error = new BuzzerReadError(e);
			this.triggerEvent('error', error);
			this.triggerEvent('leave', error);
		});
	}

	leave() {
		for(var i=0; i < this.buzzersCount; i++) {
			this.light(i, 0x00);
		}
		
		this.device.close();
	}

	light(controllerIndexes, value) {
		if (value != 0x00 && value != 0xFF) {
			throw new Error("light should have a value of 0x0 or 0xFF")
		}

		var indexes = [];
		if (typeof(controllerIndexes) == 'number') {
			indexes = [controllerIndexes];
		} else {
			indexes = controllerIndexes
		}
		
		for(var i=0; i < indexes.length; i++) {
			var message = [];
			for(var j=0; j <= 64; j++) {
				message[j] = 0x00;
			}
			message[0] = 1;
			message[1] = indexes[i];
			message[2] = value ? 1 : 0;

			this.device.write(message);
		}
	}

	lightOn(controllerIndexes) {
		this.light(controllerIndexes, 0xFF);
	}

	lightOff(controllerIndexes) {
		this.light(controllerIndexes, 0x0);
	}

	blink(controllerIndexes, times, duration) {
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
		return this.buzzersCount;
	}


}
