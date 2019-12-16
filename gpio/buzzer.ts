
import * as rpio from 'rpio';
import { Buzzer } from '../buzzer';

export interface GPIODomePushButton {
	button: number,
	led: number
};

type indexes = number | Array<number>;

interface IDictionnary<T> {
	[index: string]: T;
}

export class GPIOBuzzer implements Buzzer {
	buttons: Array<GPIODomePushButton>;
	handlers: IDictionnary<Array<Function>>;
	eventListeners: { 'ready': Array<Function>, 'leave': Array<Function> };
	constructor(buttons:Array<GPIODomePushButton>) {
		this.eventListeners = { 'ready': [], 'leave': [] };
		this.buttons = buttons;
		openPins.call(this);
		this.handlers = {};
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
		closePins.call(this);
	}

	lightOn(controllerIndexes) {
		light.call(this, controllerIndexes, rpio.HIGH);
	}

	lightOff(controllerIndexes) {
		light.call(this, controllerIndexes, rpio.LOW)
	}

	blink(controllerIndexes:Array<number>, times:number = 5, duration:number = 150): Promise<void> {
		return new Promise((resolve) => {
			for(var i=0; i < times; i++) {
				this.lightOn(controllerIndexes);
				rpio.msleep(duration);
				this.lightOff(controllerIndexes);
				rpio.msleep(duration);
			}
			resolve();
		});
	}

	onPress(callback: Function, controllerIndex: number = undefined, buttonIndex:number = undefined): Function {
		console.log('onPress : ')
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
		return this.buttons.length;
	}
}

function light(controllerIndexes, value:number) {
	console.log('light : ', controllerIndexes, value)
	if (typeof(controllerIndexes) == 'number') {
		console.log('LED : ', this.buttons[controllerIndexes].led)
		rpio.write(this.buttons[controllerIndexes].led, value);
	} else {
		for(var i=0; i < controllerIndexes.length; i++) {
			console.log('LED : ', this.buttons[i].led)
			rpio.write(this.buttons[i].led, value);
		}
	}

}

function openPins() {
	console.log('buttons : ', this.buttons);
	this.buttons.forEach((pin: GPIODomePushButton, controllerIndex:number) => {
		rpio.open(pin.led, rpio.OUTPUT, rpio.LOW);
		rpio.open(pin.button, rpio.INPUT);
		console.log('listening : ', pin.button)
		rpio.poll(pin.button, () => {
			var pressed = !rpio.read(pin.button);
			if (pressed) {
				var key = 'c'+controllerIndex;
				if (key in this.handlers) {
					callHandlers(this.handlers[key], controllerIndex, 0);
				}
				if ('all' in this.handlers) {
					callHandlers(this.handlers['all'], controllerIndex, 0);
				}
			}
		});

	});
}

function closePins() {
	console.log('close pins : ', this.buttons);
	for(var i=0; i < this.buttons.length; i++) {
		var pin = this.buttons[i];
		rpio.poll(pin.button, null);
		this.lightOff(i);
		rpio.close(pin.led);
		rpio.close(pin.button);
	}
	console.log('endclose')
}

function callHandlers(handlers:Array<Function>, controllerIndex:number, buttonIndex:number) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}