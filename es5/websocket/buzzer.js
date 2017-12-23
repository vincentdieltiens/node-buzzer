
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.WebsocketBuzzer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ip = require('ip');

var ip = _interopRequireWildcard(_ip);

var _nodejsWebsocket = require('nodejs-websocket');

var ws = _interopRequireWildcard(_nodejsWebsocket);

var _Buzzer2 = require('../Buzzer');

var _BuzzerNotFoundError = require('../BuzzerNotFoundError');

var _BuzzerReadError = require('../BuzzerReadError');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebsocketBuzzer = exports.WebsocketBuzzer = function (_Buzzer) {
	_inherits(WebsocketBuzzer, _Buzzer);

	function WebsocketBuzzer() {
		var port = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8083;

		_classCallCheck(this, WebsocketBuzzer);

		var _this = _possibleConstructorReturn(this, (WebsocketBuzzer.__proto__ || Object.getPrototypeOf(WebsocketBuzzer)).call(this));

		_this.port = port;
		_this.handlers = [];
		return _this;
	}

	_createClass(WebsocketBuzzer, [{
		key: 'connect',
		value: function connect() {
			var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			this.timeout = timeout;
			this.initWebsocket();
		}
	}, {
		key: 'leave',
		value: function leave() {
			this.ws.close();
		}
	}, {
		key: 'lightOn',
		value: function lightOn(controllerIndexes /*:any*/) {
			this.conn.send(JSON.stringify({
				'lights': controllerIndexes,
				'on': true
			}));
		}
	}, {
		key: 'lightOff',
		value: function lightOff(controllerIndexes /*:any*/) {
			this.conn.send(JSON.stringify({
				'lights': controllerIndexes,
				'on': false
			}));
		}
	}, {
		key: 'blink',
		value: function blink(controllerIndexes /*:Array<number>*/) {
			var times /*:number*/ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
			var duration /*:number*/ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.2;
		}
	}, {
		key: 'initWebsocket',
		value: function initWebsocket() {
			var _this2 = this;

			console.log('WebBuzzer : listening ws on ' + this.port);

			var interval = void 0;
			var startTime = Date.now();
			var tick = function tick() {
				var currentTime = Date.now();
				if (_this2.timeout > 0 && currentTime - startTime > _this2.timeout) {
					clearInterval(interval);
					if (_this2.ws) {
						_this2.ws.close();
					}
					_this2.triggerEvent('error', new _BuzzerNotFoundError.BuzzerNotFoundError('PS2 buzzer not found'));
				}
			};
			interval = setInterval(tick, 1000);
			tick();

			this.ws = ws.createServer(function (conn) {
				_this2.conn = conn;

				clearInterval(interval);
				_this2.triggerEvent('ready');

				conn.on("text", function (str /*:string*/) {
					var data = JSON.parse(str);

					if (data.press != undefined) {
						var controllerIndex = data.press;
						var buttonIndex = 0;

						var key = 'c' + controllerIndex;
						_this2.callHandlers(key, controllerIndex, buttonIndex);
						_this2.callHandlers('all', controllerIndex, buttonIndex);
					}
				});

				conn.on("close", function (code /*:number*/, reason /*:string*/) {
					_this2.conn = null;
					_this2.triggerEvent('leave', new _BuzzerReadError.BuzzerReadError(reason));
				});
			}).listen(this.port);
		}
	}, {
		key: 'controllersCount',
		value: function controllersCount() /*:number*/{
			return 4;
		}
	}]);

	return WebsocketBuzzer;
}(_Buzzer2.Buzzer);
//# sourceMappingURL=buzzer.js.map
