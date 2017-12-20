'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.GPIOBuzzer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rpio = require('rpio');

var rpio = _interopRequireWildcard(_rpio);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GPIOBuzzer /*implements Buzzer*/ = exports.GPIOBuzzer = function () {
	function GPIOBuzzer(buttons /*:Array<GPIODomePushButton>*/) {
		_classCallCheck(this, GPIOBuzzer);

		this.eventListeners = { 'ready': [], 'leave': [] };
		this.buttons = buttons;
		openPins.call(this);
		this.handlers = {};
	}

	_createClass(GPIOBuzzer, [{
		key: 'addEventListener',
		value: function addEventListener(event, callback /*: Function*/) {
			this.eventListeners[event].push(callback);
			if (event == 'ready') {
				callback();
			}
		}
	}, {
		key: 'removeEventListener',
		value: function removeEventListener(event /*: string*/, callback /*: Function*/) {
			var index = this.eventListeners[event].indexOf(callback);
			this.eventListeners[event].splice(index, 1);
		}
	}, {
		key: 'leave',
		value: function leave() {
			closePins.call(this);
		}
	}, {
		key: 'lightOn',
		value: function lightOn(controllerIndexes) {
			light.call(this, controllerIndexes, rpio.HIGH);
		}
	}, {
		key: 'lightOff',
		value: function lightOff(controllerIndexes) {
			light.call(this, controllerIndexes, rpio.LOW);
		}
	}, {
		key: 'blink',
		value: function blink(controllerIndexes /*:Array<number>*/) {
			var times /*:number*/ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
			var duration /*:number*/ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 150;

			for (var i = 0; i < times; i++) {
				this.lightOn(controllerIndexes);
				rpio.msleep(duration);
				this.lightOff(controllerIndexes);
				rpio.msleep(duration);
			}
		}
	}, {
		key: 'onPress',
		value: function onPress(callback /*: Function*/) /*: Function*/{
			var _this = this;

			var controllerIndex /*: number*/ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
			var buttonIndex /*:number*/ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

			console.log('onPress : ');
			var key = 'all';
			if (controllerIndex != undefined || buttonIndex != undefined) {
				key = '';
				if (controllerIndex != undefined) {
					key = 'c' + controllerIndex;
				}
				if (buttonIndex != undefined) {
					key += 'b' + buttonIndex;
				}
			}

			if (!(key in this.handlers)) {
				this.handlers[key] = [];
			}
			this.handlers[key].push(callback);
			return function () {
				var index = _this.handlers[key].indexOf(callback);
				if (index >= 0) {
					_this.handlers[key].splice(index, 1);
				}
			};
		}
	}, {
		key: 'controllersCount',
		value: function controllersCount() /*:number*/{
			return this.buttons.length;
		}
	}]);

	return GPIOBuzzer;
}();

function light(controllerIndexes, value /*:number*/) {
	console.log('light : ', controllerIndexes, value);
	if (typeof controllerIndexes == 'number') {
		console.log('LED : ', this.buttons[controllerIndexes].led);
		rpio.write(this.buttons[controllerIndexes].led, value);
	} else {
		for (var i = 0; i < controllerIndexes.length; i++) {
			console.log('LED : ', this.buttons[i].led);
			rpio.write(this.buttons[i].led, value);
		}
	}
}

function openPins() {
	var _this2 = this;

	console.log('buttons : ', this.buttons);
	this.buttons.forEach(function (pin /*: GPIODomePushButton*/, controllerIndex /*:number*/) {
		rpio.open(pin.led, rpio.OUTPUT, rpio.LOW);
		rpio.open(pin.button, rpio.INPUT);
		console.log('listening : ', pin.button);
		rpio.poll(pin.button, function () {
			var pressed = !rpio.read(pin.button);
			if (pressed) {
				var key = 'c' + controllerIndex;
				if (key in _this2.handlers) {
					callHandlers(_this2.handlers[key], controllerIndex, 0);
				}
				if ('all' in _this2.handlers) {
					callHandlers(_this2.handlers['all'], controllerIndex, 0);
				}
			}
		});
	});
}

function closePins() {
	console.log('close pins : ', this.buttons);
	for (var i = 0; i < this.buttons.length; i++) {
		var pin = this.buttons[i];
		rpio.poll(pin.button, null);
		this.lightOff(i);
		rpio.close(pin.led);
		rpio.close(pin.button);
	}
	console.log('endclose');
}

function callHandlers(handlers /*:Array<Function>*/, controllerIndex /*:number*/, buttonIndex /*:number*/) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}
//# sourceMappingURL=buzzer.js.map
