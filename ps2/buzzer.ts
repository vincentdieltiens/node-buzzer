'use strict';

import * as HID from 'node-hid';
import { Buzzer, BuzzerEvent } from '../buzzer';
import { BuzzerNotFoundError } from '../BuzzerNotFoundError';

type PS2Signal = [number, number, number, number, number];

type PS2Light = 0x00 | 0xFF;

/**
 * @internal
 * Signals defined and used by the PS2 controller
 */
const signals: PS2Signal[] = [
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

/**
 * Tests if two PS2 signals are equals
 * @param a the first signal
 * @param b the second signal
 * @returns true if the signals are the same, false otherwise
 */
function signalsEqual(a: PS2Signal, b: PS2Signal): boolean {
	for (var i = 0; i < 5; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}

/**
 * Searches the signal in the list of recognized PS2 buzzers and return his index
 * @param signal the signal to search
 * @returns the signal index if found, -1 otherwise
 */
function searchSignalIndex(signal: PS2Signal): number {
	for (var i = 0; i < signals.length; i++) {
		if (signalsEqual(signal, signals[i])) {
			return i;
		}
	}
	return -1;
}

/**
 *
 * @param handlers
 * @param controllerIndex
 * @param buttonIndex
 */
function callHandlers(handlers: Array<Function>, controllerIndex: number, buttonIndex: number) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}

/**
 * Represents a PS2 Buzzer
 */
export class Ps2Buzzer implements Buzzer {
	/** @var device the PS2 HID device */
	device: HID.HID;

	/** @var lights the status of all the buzzer lights */
	lights: Array<any> = [0x0, 0x0, 0x0, 0x0];

	/** @var handlers the press event handlers */
	handlers: Array<Array<Function>> = [];

	/** @var eventListeners the registered event listeners */
	eventListeners: {
		'ready': Array<Function>,
		'leave': Array<Function>,
		'press': Array<Function>
	} = {
			'ready': [],
			'leave': [],
			'press': []
		};

	/**
	 * @internal
	 * @param device
	 */
	constructor(device: HID.HID = null) {

		// Sets the device
		try {
			this.device = device
			if (this.device === null) {
				this.device = new HID.HID(0x054c, 0x1000);
			}
		} catch (e) {
			throw new BuzzerNotFoundError("No PS2 buzzer found");
		}

		this.device.on("data", (signal: PS2Signal) => {
			const signalIndex = searchSignalIndex(signal);

			if (signalIndex >= 0) {
				const controllerIndex = Math.floor(signalIndex / 5);
				const buttonIndex = signalIndex % 5;

				let key = 'c' + controllerIndex + 'b' + buttonIndex;
				callHandlers(this.handlers[key], controllerIndex, buttonIndex);

				key = 'c' + controllerIndex;
				callHandlers(this.handlers[key], controllerIndex, buttonIndex);

				callHandlers(this.handlers['all'], controllerIndex, buttonIndex);
				this.eventListeners['press'].forEach(f => f(controllerIndex, buttonIndex));
			}
		});

		this.device.on("error", () => {
			this.eventListeners['leave'].forEach((f) => {
				f();
			});
		});
	}

	/**
	 * Attaches an event listener to a given event
	 * @param event the event of the handler
	 * @param callback the listener for that event
	 */
	addEventListener(event: BuzzerEvent, callback: Function) {
		this.eventListeners[event].push(callback);
		if (event == 'ready') {
			callback();
		}
	}

	/**
	 * Removes a given handler for a given event
	 * @param event the event of the listener
	 * @param callback the event listener to attach
	 */
	removeEventListener(event: BuzzerEvent, callback: Function) {
		const index = this.eventListeners[event].indexOf(callback);
		this.eventListeners[event].splice(index, 1);
	}

	/**
	 * Turns all the lights off and close the device
	 */
	leave(): void {
		this.light([0, 1, 2, 3], false);
		this.device.close();
	}

	/**
	 * Turns the lights on or off
	 * @param controllerIndexes a controller index or an array of controller indexes
	 * @param value true to turn on, false to turn off
	 */
	light(controllerIndexes: number | number[], value: boolean): void {
		const message = [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0];

		if (typeof (controllerIndexes) == 'number') {
			this.lights[controllerIndexes] = value ? 0xFF : 0x00;
		} else {
			for (var ctrl in controllerIndexes) {
				this.lights[controllerIndexes[ctrl]] = value ? 0xFF : 0x00;
			}
		}

		for (let i in this.lights) {
			// The first two items are not for the lights
			let j = parseInt(i, 10) + 2;
			message[j] = this.lights[i];
		}

		this.device.write(message);
	}

	/**
	 * Turns the lights on
	 * @param controllerIndexes the controller index or an array of controller indexes
	 */
	lightOn(controllerIndexes: number | number[]): void {
		this.light(controllerIndexes, true);
	}

	/**
	 * Turns the lights off
	 * @param controllerIndexes the controller index or an array of controller indexes
	 */
	lightOff(controllerIndexes: number | number[]): void {
		this.light(controllerIndexes, false);
	}

	isLightOn(controllerIndex: number): boolean {
		return this.lights[controllerIndex] === '0xFF';
	}

	/**
	 * Makes one or more controllers to blink
	 * @param controllerIndexes the controller index or an array of controller indexes
	 * @param times the number of blink
	 * @param duration the duration of each blink
	 * @param lightOnAtEnd (default: true) is the light on after the blinking
	 */
	blink(controllerIndexes: number | number[], times: number = 5, duration: number = 150, lightOnAtEnd: boolean = true): Promise<void> {
		return new Promise((resolve, reject) => {
			let on = true;
			let count = 1;
			let totalTimes = times * 2 - (lightOnAtEnd ? 1 : 0);
			const _update = () => {

				if (count > totalTimes) {
					clearInterval(interval);
					resolve();
					return;
				}

				if (on) {
					this.lightOn(controllerIndexes);
				} else {
					this.lightOff(controllerIndexes);
				}

				count++;
				on = !on;
			}

			_update();
			let interval = setInterval(_update, duration);
		});
	}

	/**
	 * Press event listener
	 * @param callback the event listener
	 * @param controllerIndex the index of the controller if listening for a specific controller
	 * @param buttonIndex the button index if listening for a specific button
	 * @returns the function to remove the listener
	 */
	onPress(callback: Function, controllerIndex: number = undefined, buttonIndex: number = undefined): Function {
		var key = 'all';
		if (controllerIndex != undefined || buttonIndex != undefined) {
			key = '';
			if (controllerIndex != undefined) {
				key = 'c' + controllerIndex;
			}
			if (buttonIndex != undefined) {
				key += 'b' + buttonIndex
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

	/**
	 * Gets the number of controllers
	 * @returns the number of controllers
	 */
	controllersCount(): number {
		return 4;
	}
}
