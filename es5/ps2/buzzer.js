'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Ps2Buzzer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeHid = require('node-hid');

var HID = _interopRequireWildcard(_nodeHid);

var _BuzzerNotFoundError = require('../BuzzerNotFoundError');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var signals = [
// controller 1
[0, 0, 1, 0, 240], [0, 0, 16, 0, 240], [0, 0, 8, 0, 240], [0, 0, 4, 0, 240], [0, 0, 2, 0, 240],
// controller 2
[0, 0, 32, 0, 240], [0, 0, 0, 2, 240], [0, 0, 0, 1, 240], [0, 0, 128, 0, 240], [0, 0, 64, 0, 240],
// controller 3
[0, 0, 0, 4, 240], [0, 0, 0, 64, 240], [0, 0, 0, 32, 240], [0, 0, 0, 16, 240], [0, 0, 0, 8, 240],
// controller 4
[0, 0, 0, 128, 240], [0, 0, 0, 0, 248], [0, 0, 0, 0, 244], [0, 0, 0, 0, 242], [0, 0, 0, 0, 241]];

function signalsEqual(a, b) {
	for (var i = 0; i < 5; i++) {
		if (a[i] != b[i]) {
			return false;
		}
	}
	return true;
}

function searchSignalIndex(signal) /*: number*/{
	for (var i = 0; i < signals.length; i++) {
		if (signalsEqual(signal, signals[i])) {
			return i;
		}
	}
	return -1;
}

function callHandlers(handlers /*:Array<Function>*/, controllerIndex /*:number*/, buttonIndex /*:number*/) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}

var Ps2Buzzer /*implements Buzzer*/ = exports.Ps2Buzzer = function () {
	//device/*: HID*/.HID;
	//lights/*: Array*/<any>;
	//handlers/*: Array*/<Array<Function>>;
	//eventListeners: { 'ready': Array<Function>, 'leave': Array<Function> };
	function Ps2Buzzer(device) {
		var _this = this;

		_classCallCheck(this, Ps2Buzzer);

		if (!device) {
			try {
				device = new HID.HID(0x054c, 0x1000);
			} catch (e) {
				throw new _BuzzerNotFoundError.BuzzerNotFoundError("No PS2 Buzzer found :" + e.message);
			}
		}
		this.device = device;

		this.eventListeners = { 'ready': [], 'leave': [] };
		this.lights = [0x0, 0x0, 0x0, 0x0];

		this.handlers = [];
		this.device.on("data", function (signal) {
			var signalIndex = searchSignalIndex(signal);
			if (signalIndex >= 0) {
				var controllerIndex = Math.floor(signalIndex / 5);
				var buttonIndex = signalIndex % 5;

				var key = 'c' + controllerIndex + 'b' + buttonIndex;
				callHandlers(_this.handlers[key], controllerIndex, buttonIndex);

				key = 'c' + controllerIndex;
				callHandlers(_this.handlers[key], controllerIndex, buttonIndex);

				callHandlers(_this.handlers['all'], controllerIndex, buttonIndex);
			}
		});

		this.device.on("error", function () {
			_this.eventListeners['leave'].forEach(function (f) {
				f();
			});
		});
	}

	_createClass(Ps2Buzzer, [{
		key: 'addEventListener',
		value: function addEventListener(event /*: string*/, callback /*: Function*/) {
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
			this.light([0, 1, 2, 3], 0x00);
			this.device.close();
		}
	}, {
		key: 'light',
		value: function light(controllerIndexes, value) {
			if (value != 0x00 && value != 0xFF) {
				throw new Error("light should have a value of 0x0 or 0xFF");
			}
			var message = [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0];

			if (typeof controllerIndexes == 'number') {
				this.lights[controllerIndexes] = value;
			} else {
				for (var ctrl in controllerIndexes) {
					this.lights[controllerIndexes[ctrl]] = value;
				}
			}

			for (var i in this.lights) {
				var j = parseInt(i, 10) + 2;
				message[j] = this.lights[i];
			}

			this.device.write(message);
		}
	}, {
		key: 'lightOn',
		value: function lightOn(controllerIndexes) {
			this.light(controllerIndexes, 0xFF);
		}
	}, {
		key: 'lightOff',
		value: function lightOff(controllerIndexes) {
			this.light(controllerIndexes, 0x0);
		}
	}, {
		key: 'blink',
		value: function blink(controllerIndexes) {
			var _this2 = this;

			var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
			var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 150;

			var on = true;
			var count = 0;
			var interval = setInterval(function () {
				if (on) {
					if (count > times) {
						clearInterval(interval);
						return;
					}
					_this2.lightOn(controllerIndexes);
					count++;
				} else {
					_this2.lightOff(controllerIndexes);
				}

				on = !on;
			}, duration);
		}
	}, {
		key: 'onPress',
		value: function onPress(callback /*: Function*/) /*: Function*/{
			var _this3 = this;

			var controllerIndex /*: number*/ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
			var buttonIndex /*: number*/ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

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
				var index = _this3.handlers[key].indexOf(callback);
				if (index >= 0) {
					_this3.handlers[key].splice(index, 1);
				}
			};
		}
	}, {
		key: 'controllersCount',
		value: function controllersCount() /*:number*/{
			return 4;
		}
	}]);

	return Ps2Buzzer;
}();
//# sourceMappingURL=buzzer.js.map
