
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

var _buzzer = require('../buzzer');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function callHandlers(handlers /*:Array<Function>*/, controllerIndex /*:number*/, buttonIndex /*:number*/) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}

var WebsocketBuzzer /*implements Buzzer*/ = exports.WebsocketBuzzer = function () {
	// The websocket server, Connection & port
	//ws: ws.Server;
	//conn: ws.Connection;
	//port: number;

	// listeners
	//handlers: Array<Array<Function>>;

	//eventListeners: { 'ready': Array<Function>, 'leave': Array<Function> };

	function WebsocketBuzzer() {
		var port /*:number*/ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8083;

		_classCallCheck(this, WebsocketBuzzer);

		this.port = port;
		this.handlers = [];

		this.eventListeners = { 'ready': [], 'leave': [] };

		this.initWebsocket();
	}

	_createClass(WebsocketBuzzer, [{
		key: 'addEventListener',
		value: function addEventListener(event /*: string*/, callback /*: Function*/) {
			this.eventListeners[event].push(callback);
			if (event == 'ready' && this.conn) {
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
		value: function leave() /*: void*/{
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
		key: 'onPress',
		value: function onPress(callback /*: Function*/) /*: Function*/{
			var _this = this;

			var controllerIndex /*?:number*/ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
			var buttonIndex /*?:number*/ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

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
		key: 'initWebsocket',
		value: function initWebsocket() {
			var _this2 = this;

			console.log('WebBuzzer : listening ws on ' + this.port);
			this.ws = ws.createServer(function (conn) {
				_this2.conn = conn;

				_this2.eventListeners['ready'].forEach(function (f) {
					f();
				});

				conn.on("text", function (str /*:string*/) {
					var data = JSON.parse(str);

					if (data.press != undefined) {
						var controllerIndex = data.press;
						var buttonIndex = 0;

						var key = 'c' + controllerIndex;
						callHandlers(_this2.handlers[key], controllerIndex, buttonIndex);

						callHandlers(_this2.handlers['all'], controllerIndex, buttonIndex);
					}
				});

				conn.on("close", function (code /*:number*/, reason /*:string*/) {
					_this2.conn = null;
					_this2.eventListeners['leave'].forEach(function (f) {
						f();
					});
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
}();
//# sourceMappingURL=buzzer.js.map
