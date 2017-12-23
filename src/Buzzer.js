function callHandlers(handlers/*:Array<Function>*/, controllerIndex/*:number*/, buttonIndex/*:number*/) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}

function throwImplementError(method) {
	throw new Error("You have to implement the "+method+" method");
}

export class Buzzer {
	constructor() {
		this.eventListeners = { 'ready': [], 'leave': [], 'error': [] };
		this.handlers = [];
	}

	addEventListener(event/*: string*/, callback/*: Function*/) {
		this.eventListeners[event].push(callback);
	}

	removeEventListener(event/*: string*/, callback/*: Function*/) {
		var index = this.eventListeners[event].indexOf(callback);
		this.eventListeners[event].splice(index, 1);
	}

	triggerEvent(event, parameters) {
		if (event in this.eventListeners) {
			this.eventListeners[event].map((listener) => listener.call(listener, parameters));
		}
	}

	callHandlers(key, controllerIndex, buttonIndex) {
		if (this.handlers && this.handlers[key]) {
			let handlers = this.handlers[key];
			for (var i in handlers) {
				handlers[i](controllerIndex, buttonIndex);
			}
		}
	}

	onPress(callback/*: Function*/, controllerIndex/*: number*/, buttonIndex/*: number*/)/*: Function */{
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

	connect(timeout=3000) {
		throwImplementError("connect");
	}

	leave() {
		throwImplementError("leave");
	}

	light(controllerIndex, value) {
		throwImplementError("light");
	}

	lightOn(controllerIndexes) {
		throwImplementError("lightOn");
	}

	lightOff(controllerIndexes) {
		throwImplementError("lightOff");
	}

	blink(controllerIndexes, times, duration) {
		throwImplementError("blink");
	}

	controllersCount() {
		throwImplementError("controllersCount");
	}
}