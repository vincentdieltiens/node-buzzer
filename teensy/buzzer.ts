import { Buzzer } from '../buzzer';
import { BuzzerNotFoundError } from '../BuzzerNotFoundError';
import * as HID from 'node-hid';

function callHandlers(handlers:Array<Function>, controllerIndex:number, buttonIndex:number) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}

export class TeensyBuzzer implements Buzzer {
	device: HID.HID;
	eventListeners: { 'ready': Array<Function>, 'leave': Array<Function> };
	handlers: Array<Array<Function>>;
	buzzersCount: number;
	constructor() {
		var devices = HID.devices()
		var deviceInfo = devices.find( function(d) {
			return d.vendorId===0x16C0 
					&& d.productId===0x0486 
					&& d.usagePage===0xFFAB 
					&& d.usage===0x200;
		});
		
		if (!deviceInfo) {
			try {
				this.device = new HID.HID(5824, 1158);
			} catch(e) {
				throw new BuzzerNotFoundError("No teensy buzzer found");
			}
		} else {
			this.device = new HID.HID(deviceInfo.path);
		}

		this.buzzersCount = 2;
		this.eventListeners = { 'ready': [], 'leave': [] };

		this.handlers = [];
		this.device.on("data", (signal) => {
			var controllerIndex = signal[0];
			callHandlers(this.handlers['c'+controllerIndex], controllerIndex, 0);
			callHandlers(this.handlers['all'], controllerIndex, 0);
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

	onPress(callback: Function, controllerIndex: number, buttonIndex: number): Function {
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
		return this.buzzersCount;
	}


}
