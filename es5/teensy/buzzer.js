'use strict';

//import { Buzzer } from '../buzzer';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TeensyBuzzer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BuzzerNotFoundError = require('../BuzzerNotFoundError');

var _nodeHid = require('node-hid');

var HID = _interopRequireWildcard(_nodeHid);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function callHandlers(handlers, controllerIndex, buttonIndex) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}

var TeensyBuzzer /*implements Buzzer*/ = exports.TeensyBuzzer = function () {
	//device: HID.HID;
	//eventListeners: { 'ready': Array<Function>, 'leave': Array<Function> };
	//handlers: Array<Array<Function>>;
	//buzzersCount: number;
	function TeensyBuzzer() {
		var _this = this;

		var buzzersCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;

		_classCallCheck(this, TeensyBuzzer);

		var devices = HID.devices();
		var deviceInfo = devices.find(function (d) {
			return d.vendorId === 0x16C0 && d.productId === 0x0486 && d.usagePage === 0xFFAB && d.usage === 0x200;
		});

		if (!deviceInfo) {
			try {
				this.device = new HID.HID(5824, 1158);
			} catch (e) {
				throw new _BuzzerNotFoundError.BuzzerNotFoundError("No teensy buzzer found");
			}
		} else {
			this.device = new HID.HID(deviceInfo.path);
		}

		this.buzzersCount = buzzersCount;
		this.eventListeners = { 'ready': [], 'leave': [] };

		this.handlers = [];
		this.device.on("data", function (signal) {
			var controllerIndex = signal[0];
			callHandlers(_this.handlers['c' + controllerIndex], controllerIndex, 0);
			callHandlers(_this.handlers['all'], controllerIndex, 0);
		});

		this.device.on("error", function () {
			_this.eventListeners['leave'].forEach(function (f) {
				f();
			});
		});
	}

	_createClass(TeensyBuzzer, [{
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
			for (var i = 0; i < this.buzzersCount; i++) {
				this.light(i, 0x00);
			}

			this.device.close();
		}
	}, {
		key: 'light',
		value: function light(controllerIndexes, value) {
			if (value != 0x00 && value != 0xFF) {
				throw new Error("light should have a value of 0x0 or 0xFF");
			}

			var indexes = [];
			if (typeof controllerIndexes == 'number') {
				indexes = [controllerIndexes];
			} else {
				indexes = controllerIndexes;
			}

			for (var i = 0; i < indexes.length; i++) {
				var message = [];
				for (var j = 0; j <= 64; j++) {
					message[j] = 0x00;
				}
				message[0] = 1;
				message[1] = indexes[i];
				message[2] = value ? 1 : 0;

				this.device.write(message);
			}
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
		value: function blink(controllerIndexes, times, duration) {
			var _this2 = this;

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
		value: function onPress(callback /*: Function*/, controllerIndex /*: number*/, buttonIndex /*: number*/) /*: Function */{
			var _this3 = this;

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
			return this.buzzersCount;
		}
	}]);

	return TeensyBuzzer;
}();
//# sourceMappingURL=buzzer.js.map
