'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Ps2Buzzer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeHid = require('node-hid');

var HID = _interopRequireWildcard(_nodeHid);

var _Buzzer2 = require('../Buzzer');

var _BuzzerNotFoundError = require('../BuzzerNotFoundError');

var _BuzzerReadError = require('../BuzzerReadError');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var Ps2Buzzer = exports.Ps2Buzzer = function (_Buzzer) {
	_inherits(Ps2Buzzer, _Buzzer);

	function Ps2Buzzer() {
		var device = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

		_classCallCheck(this, Ps2Buzzer);

		var _this = _possibleConstructorReturn(this, (Ps2Buzzer.__proto__ || Object.getPrototypeOf(Ps2Buzzer)).call(this));

		_this.eventListeners = { 'ready': [], 'leave': [], 'error': [] };
		_this.lights = [0x0, 0x0, 0x0, 0x0];
		_this.handlers = [];
		return _this;
	}

	_createClass(Ps2Buzzer, [{
		key: 'connect',
		value: function connect() {
			var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			this.timeout = timeout;
			this.waitForDevice();
		}
	}, {
		key: 'waitForDevice',
		value: function waitForDevice() {
			var _this2 = this;

			var interval = void 0;
			var startTime = Date.now();
			var tick = function tick() {
				var currentTime = Date.now();
				if (_this2.timeout > 0 && currentTime - startTime > _this2.timeout) {
					clearInterval(interval);
					_this2.triggerEvent('error', new _BuzzerNotFoundError.BuzzerNotFoundError('PS2 buzzer not found'));
				}

				if (!_this2.device) {
					try {
						_this2.device = new HID.HID(0x054c, 0x1000);
						clearInterval(interval);
					} catch (e) {
						return; // Do not init at this tick
					}
				} else {
					clearInterval(interval);
				}

				_this2.init();
			};
			interval = setInterval(tick, 1000);
			tick();
		}
	}, {
		key: 'init',
		value: function init(device) {
			var _this3 = this;

			this.triggerEvent('ready');
			this.device.on("data", function (signal) {
				var signalIndex = searchSignalIndex(signal);
				if (signalIndex >= 0) {
					var controllerIndex = Math.floor(signalIndex / 5);
					var buttonIndex = signalIndex % 5;

					var key = 'c' + controllerIndex + 'b' + buttonIndex;
					_this3.callHandlers(key, controllerIndex, buttonIndex);

					key = 'c' + controllerIndex;
					_this3.callHandlers(key, controllerIndex, buttonIndex);
					_this3.callHandlers('all', controllerIndex, buttonIndex);
				}
			});

			this.device.on("error", function (e) {
				var error = new _BuzzerReadError.BuzzerReadError(e);
				_this3.triggerEvent('error', error);
				_this3.triggerEvent('leave', error);
			});
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
			var _this4 = this;

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
					_this4.lightOn(controllerIndexes);
					count++;
				} else {
					_this4.lightOff(controllerIndexes);
				}

				on = !on;
			}, duration);
		}
	}, {
		key: 'controllersCount',
		value: function controllersCount() /*:number*/{
			return 4;
		}
	}]);

	return Ps2Buzzer;
}(_Buzzer2.Buzzer);
//# sourceMappingURL=buzzer.js.map
