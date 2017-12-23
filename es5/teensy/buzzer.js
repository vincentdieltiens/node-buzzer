'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TeensyBuzzer = undefined;

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

function getDevice(deviceInfo) {
	if (!deviceInfo) {
		return new HID.HID(5824, 1158);
	} else {
		return new HID.HID(deviceInfo.path);
	}
}

var TeensyBuzzer = exports.TeensyBuzzer = function (_Buzzer) {
	_inherits(TeensyBuzzer, _Buzzer);

	function TeensyBuzzer() {
		var buzzersCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;

		_classCallCheck(this, TeensyBuzzer);

		var _this = _possibleConstructorReturn(this, (TeensyBuzzer.__proto__ || Object.getPrototypeOf(TeensyBuzzer)).call(this));

		_this.buzzersCount = buzzersCount;
		return _this;
	}

	_createClass(TeensyBuzzer, [{
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

			var devices = HID.devices();
			var deviceInfo = devices.find(function (d) {
				return d.vendorId === 0x16C0 && d.productId === 0x0486 && d.usagePage === 0xFFAB && d.usage === 0x200;
			});

			var interval = void 0;
			var startTime = Date.now();
			var tick = function tick() {
				var currentTime = Date.now();
				if (_this2.timeout > 0 && currentTime - startTime > _this2.timeout) {
					clearInterval(interval);
					_this2.triggerEvent('error', new _BuzzerNotFoundError.BuzzerNotFoundError('Teensy buzzer not found'));
				}

				try {
					_this2.device = getDevice(deviceInfo);
					clearInterval(interval);
					_this2.init();
				} catch (e) {
					// do nothing
				}
			};
			interval = setInterval(tick, 1000);
			tick();
		}
	}, {
		key: 'init',
		value: function init() {
			var _this3 = this;

			this.triggerEvent('ready');
			this.device.on("data", function (signal) {
				var controllerIndex = signal[0];
				_this3.callHandlers('c' + controllerIndex, controllerIndex, 0);
				_this3.callHandlers('all', controllerIndex, 0);
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
			var _this4 = this;

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
			return this.buzzersCount;
		}
	}]);

	return TeensyBuzzer;
}(_Buzzer2.Buzzer);
//# sourceMappingURL=buzzer.js.map
